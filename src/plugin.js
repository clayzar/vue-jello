import Collection from './components/Collection'

export default {
	install(Vue, options = {}) {
		const name = options.name || 'jello-collection'
		Vue.component(name, Collection)
	}
}