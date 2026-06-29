export async function load({ parent }) {
	const { config } = await parent();
	return { config };
}
