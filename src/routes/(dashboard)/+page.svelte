<script>
  import DashboardEditor from "./DashboardEditor.svelte";

  let { data } = $props();
</script>

<DashboardEditor initialConfig={data.config} />
