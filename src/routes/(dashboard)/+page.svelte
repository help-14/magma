<script lang="ts">
  import DashboardEditor from './DashboardEditor.svelte'

  let { data } = $props()
</script>

<DashboardEditor
  initialConfig={data.config}
  systemConfig={data.systemConfig}
  isAuthenticated={data.isAuthenticated}
  passkeyCount={data.passkeyCount}
/>
