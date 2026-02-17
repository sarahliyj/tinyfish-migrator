<template>
  <div>
    <h1>{{ title | capitalize }}</h1>
    <input @keyup.13="submit" />
    <child-component @click.native="handleClick" />
    <div v-for="user in users" :key="user.id">
      {{ user.name | uppercase }}
    </div>
    <slot-example>
      <template slot-scope="{ item }">
        {{ item.name }}
      </template>
    </slot-example>
  </div>
</template>

<script>
export default {
  data: {
    title: 'Users',
    users: []
  },
  beforeDestroy() {
    this.$off('user-updated')
    console.log('destroying')
  },
  destroyed() {
    console.log('destroyed')
  },
  created() {
    this.$on('user-added', this.handleUserAdded)
    this.$once('init', this.initialize)
  },
  methods: {
    addUser(user) {
      this.$set(this.users, this.users.length, user)
    },
    removeUser(index) {
      this.$delete(this.users, index)
    },
    getChildren() {
      return this.$children
    },
    getSlots() {
      return this.$scopedSlots
    },
    getListeners() {
      return this.$listeners
    }
  }
}
</script>
