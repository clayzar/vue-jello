<script>
	import { Collection } from 'jello'

	export default {
		props: {
			model: {
				required: true,
				type: Function
			},
			path: {
				required: true,
				type: String,
			},
			params: {
				required: false,
				type: Object
			},
			paginate: {
				required: false,
				validator(value) {
					return [true, false, 'infinite'].includes(value)
				}
			},
			autoload: {
				required: false,
				type: Boolean,
				default() {
					return true
				}
			},
			initialItems: {
				required: false,
				type: Array
			},
			cache: {
				required: false,
				type: Boolean,
				default() {
					return true
				}
			},
			map: {
				required: false,
				type: Function,
			}
		},
		data() {
			return {
				collection: this.makeCollection(),
				initialPath: this.path,
				initialParams: {...this.params}
			}
		},
		watch: {
			path(to) {
				this.reset()
			},
			params: {
				deep: true,
				handler(to) {
					this.reset()
				}
			},
			collection(to) {
				if(to && this.autoload && !to.loaded) {
					this.load()
				}
			},
			autoload(to) {
				if(to && !this.collection.loaded && !this.collection.loading) {
					this.load()
				}
			}
		},
		created() {
			console.log('Collection.vue created', this.autoload, this.collection.loading, this.collection.loaded);
			if(this.autoload && !this.collection.loading && !this.collection.loaded) {
				this.load()
			}
		},
		activated() {
			console.log('Collection.vue activated');
			if(this.autoload && !this.collection.loading && !this.collection.loaded) {
				this.load()
			}
		},
		methods: {
			reset() {
				this.collection = this.makeCollection()
			},
			load(options) {
				console.log('Collection.vue Load');
				return this.collection.load(options)
				.then(items => {
					console.log('loaded:', items);
				})
			},
			makeCollection() {
				const collection = new Collection({
					model: this.model,
					path: this.path,
					params: this.params,
					map: this.map,
					paginate: this.paginate
				})

				if(this.path == this.initialPath && this.params == this.initialParams && this.initialItems != undefined) {
					collection.items = this.initialItems
					collection.loaded = true
				}

				return collection
			}
		},
		render() {
			const { items, meta, links, loading, loaded } = this.collection
			return this.$scopedSlots.default({
				 items,
				 meta,
				 links,
				 loading,
				 loaded,
				 next: this.paginate && meta.current_page < meta.last_page ? () => this.collection.next() : undefined,
				 prev: this.paginate && meta.current_page > 1 ? () => this.collection.prev() : undefined,
			})
		}
	}
</script>