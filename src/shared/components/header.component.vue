<script>
export default {
    name: 'HeaderComponent',
    props: {
        title: {
            type: String,
            required: false,
            default: 'Header'
        }
    }
}
</script>

<template>
    <header>
        <h1>{{ title }}</h1>
    </header>
</template>

<style scoped>

</style>

