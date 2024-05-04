<script>
import { Collection } from 'jello.js';

export default {
	props: {
		model: {
			required: true,
			type: Function,
		},
		path: {
			required: true,
			type: String,
		},
		params: {
			required: false,
			type: Object,
			default() {
				return {};
			},
		},
		paginate: {
			required: false,
			validator(value) {
				return [true, false, 'infinite'].includes(value);
			},
		},
		autoload: {
			required: false,
			type: Boolean,
			default() {
				return true;
			},
		},
		initialItems: {
			required: false,
			type: Array,
		},
		cache: {
			required: false,
			type: Boolean,
			default() {
				return true;
			},
		},
		map: {
			required: false,
			type: Function,
		},
	},
	data() {
		const queryString = new URLSearchParams(this.params).toString();
		return {
			collection: null,
			initialUrl: `${this.path}?${queryString}`,
		};
	},
	computed: {
		url() {
			// only used for determining when to use the items initially supplied
			const queryString = new URLSearchParams(this.params).toString();
			return `${this.path}?${queryString}`;
		},
		items() {
			return this.collection.items;
		},
		meta() {
			return this.collection.meta;
		},
		links() {
			return this.collection.links;
		},
		additional() {
			return this.collection.additional;
		},
		loading() {
			return this.collection.loading;
		},
		loaded() {
			return this.collection.loaded;
		},
		skipInitialLoad() {
			const isSameAsInitialState = this.url === this.initialUrl;
			const hasPreloadedItems = Boolean(this.initialItems);
			return hasPreloadedItems && isSameAsInitialState;
		},
	},
	watch: {
		path(to) {
			this.reset();
		},
		params: {
			deep: true,
			handler(to, from) {
				this.reset();
			},
		},
		collection(to) {
			if (to && !this.skipInitialLoad && this.autoload && !to.loaded) {
				this.load();
			}
		},
		autoload(to) {
			if (to && !this.collection.loaded && !this.collection.loading) {
				this.load();
			}
		},
	},
	created() {
		const queryString = new URLSearchParams(this.params).toString();
		this.initialUrl = `${this.path}?${queryString}`;

		this.collection = this.makeCollection();

		if (this.autoload && !this.skipInitialLoad && !this.collection.loading && !this.collection.loaded) {
			this.load();
		}
	},
	activated() {
		if (this.autoload && !this.skipInitialLoad && !this.collection.loading && !this.collection.loaded) {
			this.load();
		}
	},
	methods: {
		reset() {
			this.collection = this.makeCollection();
		},
		load(options = {}) {
			options.config = {
				cache: {
					ignoreCache: !this.cache,
					...options.cache,
				},
				...options.config,
			};

			return this.collection.load(options).then((data) => {
				this.$emit('loaded', data);
				return data;
			});
		},
		makeCollection() {
			const collection = new Collection({
				model: this.model,
				path: this.path,
				params: this.params,
				map: this.map,
				paginate: this.paginate,
			});

			const isSameAsInitialState = this.url === this.initialUrl;
			if (Boolean(this.initialItems) && (!Boolean(this.collection) || isSameAsInitialState)) {
				collection.items = this.initialItems;
				collection.is.loaded = true;
			}

			return collection;
		},
	},
	render() {
		const {
			items,
			meta,
			links,
			additional,
			hasNext,
			hasPrev,
			is: { loading, loaded, busy } = {},
		} = this.collection;
		const slots = '$scopedSlots' in this ? this['$scopedSlots'] : this.$slots;
		return slots.default({
			items,
			meta,
			links,
			loading,
			loaded,
			busy,
			additional,
			hasNext,
			hasPrev,
			next: this.collection.hasNext ? () => this.collection.next() : null,
			prev: this.collection.hasPrev ? () => this.collection.prev() : null,
			reload: this.load,
		});
	},
};
</script>
