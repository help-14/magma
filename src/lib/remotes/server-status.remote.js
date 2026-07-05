// @ts-nocheck
import { query } from '$app/server';
import * as v from 'valibot';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { createCache } from '$lib/server/cache.js';

const execFileAsync = promisify(execFile);

const cache = createCache(300_000, 20);

const sshCmdPattern = /^ssh -p \d+ [a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+$|^ssh [a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+$/;

export const fetchServerStatus = query(
	v.object({ sshCmd: v.string() }),
	async ({ sshCmd }) => {
		if (!sshCmd.trim()) throw new Error('SSH command not configured');

		if (!sshCmdPattern.test(sshCmd.trim())) {
			throw new Error('Invalid SSH command format. Use: ssh user@host or ssh -p port user@host');
		}

		const cached = cache.get(sshCmd);
		if (cached) return cached;

		const metricsCmd = [
			"echo '---HOSTNAME---'",
			"hostname -f 2>/dev/null || hostname",
			"echo '---UPTIME---'",
			"uptime -p 2>/dev/null || uptime",
			"echo '---CPU---'",
			"nproc 2>/dev/null || echo 0",
			"echo '---LOAD---'",
			"awk '{print $1,$2,$3}' /proc/loadavg 2>/dev/null || echo '0 0 0'",
			"echo '---RAM---'",
			"free -m 2>/dev/null | awk '/Mem:/{print $2,$3,$4}' || echo '0 0 0'",
			"echo '---DISK---'",
			"df -h / 2>/dev/null | awk 'NR==2{print $2,$3,$4,$5}' || echo '0 0 0 0%'",
			"echo '---EOF---'"
		].join('; ');

		const [cmd, ...args] = sshCmd.trim().split(/\s+/);
		const { stdout, stderr } = await execFileAsync(cmd, [...args, metricsCmd], { timeout: 15000 });
		if (stderr && !stdout) throw new Error(stderr);

		function parse(marker) {
			const re = new RegExp(`---${marker}---\\s*\\n?([\\s\\S]*?)(?=\\n---(?:${['HOSTNAME', 'UPTIME', 'CPU', 'LOAD', 'RAM', 'DISK', 'EOF'].filter(m => m !== marker).join('|')})|---EOF|$)`);
			const m = stdout.match(re);
			return m ? m[1].trim() : '';
		}

		const hostname = parse('HOSTNAME');
		const uptime = parse('UPTIME');
		const cpu = parse('CPU');
		const load = parse('LOAD');
		const ramRaw = parse('RAM').split(/\s+/);
		const diskRaw = parse('DISK').split(/\s+/);

		const result = {
			hostname,
			uptime,
			cpuCores: cpu || '0',
			load: load || '0 0 0',
			ramTotal: ramRaw[0] || '0',
			ramUsed: ramRaw[1] || '0',
			ramFree: ramRaw[2] || '0',
			diskTotal: diskRaw[0] || '0',
			diskUsed: diskRaw[1] || '0',
			diskFree: diskRaw[2] || '0',
			diskUsePct: diskRaw[3] || '0%',
		};

		cache.set(sshCmd, result);
		return result;
	}
);
