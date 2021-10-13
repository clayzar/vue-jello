<script>
	import { Collection } from 'jello.js'

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
				type: Object,
				default() {
					return {}
				}
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
			const queryString = new URLSearchParams(this.params).toString()
			return {
				collection: this.makeCollection(),
				initialUrl: `${this.path}?${queryString}`
			}
		},
		computed: {
			url() { // only used for determining when to use the items initially supplied
				const queryString = new URLSearchParams(this.params).toString()
				return `${this.path}?${queryString}`
			},
			items() {
				return this.collection.items
			},
			meta() {
				return this.collection.meta
			},
			links() {
				return this.collection.links
			},
			additional() {
				return this.collection.additional
			},
			loading() {
				return this.collection.loading
			},
			loaded() {
				return this.collection.loaded
			},
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
			if(this.autoload && !this.collection.loading && !this.collection.loaded) {
				this.load()
			}
		},
		activated() {
			if(this.autoload && !this.collection.loading && !this.collection.loaded) {
				this.load()
			}
		},
		methods: {
			reset() {
				this.collection = this.makeCollection()
			},
			load(options = {}) {
				options.config = {
					cache: {
						ignoreCache: !this.cache,
						...options.cache
					},
					...options.config
				}

				return this.collection.load(options)
				.then(data => {
					this.$emit('loaded', data)
					return data
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

				const isSameAsInitialState = this.url == this.initialUrl
				if(this.initialItems && (!this.collection || isSameAsInitialState)) {
					collection.items = this.initialItems
					collection.loaded = true
				}

				return collection
			}
		},
		render() {
			const { items, meta, links, loading, loaded, additional } = this.collection
			const slots = '$scopedSlots' in this ? this['$scopedSlots'] : this.$slots
			return slots.default({
				 items,
				 meta,
				 links,
				 loading,
				 loaded,
				 additional,
				 next: this.paginate && this.collection.hasNext ? () => this.collection.next() : undefined,
				 prev: this.paginate && this.collection.hasPrev ? () => this.collection.prev() : undefined,
				 reload: this.load,
			})
		}
	}
</script>