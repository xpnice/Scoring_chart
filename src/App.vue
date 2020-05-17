<template>
  <div id="app">
    <ScoreTable />
  </div>
</template>

<script>
import ScoreTable from './components/ScoreTable'

export default {
  name: 'App',
  components: {
    ScoreTable
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
