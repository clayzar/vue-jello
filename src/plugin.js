import Collection from './components/Collection'

export default {
	install(Vue, options = {}) {
		console.log('options:', options);

		const componentName = options.componentName || 'jello-collection'
		Vue.component(componentName, Collection)

		if(options.models) {
			Vue.prototype.$models = options.models
		}
	}
}