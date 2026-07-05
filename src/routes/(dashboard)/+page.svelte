<script lang="ts">
  import DashboardEditor from "./DashboardEditor.svelte";

  let { data } = $props();
</script>

<DashboardEditor
  initialConfig={data.config}
  isAuthenticated={data.isAuthenticated}
  passkeyCount={data.passkeyCount}
/>
