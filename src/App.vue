<template>
  <div id="app">
    <ScoreTable />
    <CompareChart />
  </div>
</template>

<script>
import ScoreTable from "./components/ScoreTable/ScoreTable";
import CompareChart from "./components/CompareChart/CompareChart";
export default {
  name: "App",
  components: {
    ScoreTable,
    CompareChart
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
