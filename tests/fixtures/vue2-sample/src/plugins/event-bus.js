import Vue from 'vue'

export const EventBus = new Vue()

EventBus.$on('app-error', (err) => {
  console.error(err)
})

EventBus.$off('app-error')
EventBus.$once('app-init', () => {
  console.log('initialized')
})
