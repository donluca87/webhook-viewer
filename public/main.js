// public/main.js
const socket = io();

// Function to save an event to localStorage with data size management
function saveEventToLocalStorage(event) {
  const events = JSON.parse(localStorage.getItem('events')) || [];
  events.push(event);

  // Check if the data size exceeds a limit (e.g., 1 MB)
  if (calculateDataSize(events) > 1000000) {
    // Implement a cleanup strategy (e.g., remove the oldest events)
    const numberOfEventsToRemove = Math.ceil(events.length / 2);
    events.splice(0, numberOfEventsToRemove);
  }

  localStorage.setItem('events', JSON.stringify(events));
}

// Function to calculate the size of data in bytes
function calculateDataSize(data) {
  // Calculate the size of data in bytes (this is a simplified example)
  return new TextEncoder().encode(JSON.stringify(data)).length;
}

// Register the collapsible-item component globally
Vue.component('collapsible-item', {
  props: {
    hook: Object,
  },
  data() {
    return {
      isVisible: false,
    };
  },
  methods: {
    toggleCollapsible() {
      this.isVisible = !this.isVisible;
      this.$refs.content.style.display = this.isVisible ? 'block' : 'none';
    },
  },
  template: `
    <div>
      <button @click="toggleCollapsible" class="collapsible">
        {{ isVisible ? 'Hide event JSON' : 'Show event JSON' }}
      </button>
      <div class="content" ref="content" style="display: none;">
        <pre class="hook-item">{{ JSON.stringify(hook, null, 2) }}</pre>
      </div>
    </div>
  `,
});

new Vue({
  el: '#app',
  data: {
    hooks: [], // Store received hooks here
    searchTerm: '',
    lastHookId: null,
    filteredHookIndices: [], // Store filtered hook indices here
    eventsPerPage: 10, // Number of events to show per page
    currentPage: 1,   // Current page number
    currentPageIndicator: 1, // Add a new property for the page indicator
    eventsPerPage: 10,
  },
  methods: {
    filterHooks() {
      // Filter hooks based on searchTerm and store the filtered indices
      this.filteredHookIndices = this.filterHooksBySearchTerm();
      // Calculate the number of pages after the filter
      const totalPagesAfterFilter = this.calculateTotalPagesAfterFilter();
      // Adjust the current page if necessary to stay within the available pages
      this.currentPage = Math.min(this.currentPage, totalPagesAfterFilter);
      // Reset the current page to 1 when searching if there are no filtered results
      if (totalPagesAfterFilter === 0) {
        this.currentPage = 1;
      }
    },
    filterHooksBySearchTerm() {
      const searchTerm = this.searchTerm.toLowerCase();
      return this.hooks
        .map((hook, index) => ({ hook, index }))
        .filter(({ hook }) => this.hookContainsSearchTerm(hook, searchTerm))
        .map(({ index }) => index);
    },
    hookContainsSearchTerm(hook, searchTerm) {
      for (const key in hook) {
        const value = hook[key];
        if (value && typeof value === 'string' && value.toLowerCase().includes(searchTerm)) {
          return true;
        }
      }
      return false;
    },
    calculateTotalPagesAfterFilter() {
      return Math.ceil(this.filteredHookIndices.length / this.eventsPerPage);
    },
    clearSearch() {
      this.searchTerm = ''; // Clear the search term
      // Reset the filteredHookIndices to include all indices
      this.filteredHookIndices = this.hooks.map((_, index) => index);
    },
    clearLocalStorage() {
      localStorage.removeItem('logs'); // Remove logs
      localStorage.removeItem('lastHookId'); // Remove lastHookId
      localStorage.removeItem('timestamps'); // Remove timestamps
      this.hooks = []; // Clear the logs array in your component
      this.timestamps = []; // Clear the timestamps array in your component
      this.lastHookId = 0; // Reset the lastHookId
      this.filterHooks();
    },
    formatTimestamp(timestamp) {
      // Format the timestamp as needed
      let options = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
      };
      return new Intl.DateTimeFormat('it-IT', options).format(new Date(timestamp));
    },
    getGeneratedHookId(hook) {
      return this.hooks.indexOf(hook);
    },
    getFormattedTimestamp(index) {
      const timestampObj = this.timestamps.find((timestamp) => timestamp.id === index);
      if (timestampObj) {
        return timestampObj.timestamp;
      }
      return ''; // Handle the case when timestamp is not found
    },
    toggleCollapsible() {
      this.isActive = !this.isActive;
      console.log('isActive:', this.isActive); // Debugging line
    },
    nextPage() {
      if (this.hasNextPage) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    // Method to set the current page and page indicator
    setCurrentPage(pageNumber) {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.currentPage = pageNumber;
      }
    },
  },
  watch: {
    currentPage(newPage) {
      // Update the currentPageIndicator when currentPage changes
      this.currentPageIndicator = newPage;
    },
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredHookIndices.length / this.eventsPerPage);
    },
    hasNextPage() {
      return this.currentPage < this.totalPages;
    },
    paginatedHooks() {
      const startIndex = (this.currentPage - 1) * this.eventsPerPage;
      const endIndex = startIndex + this.eventsPerPage;
      return this.filteredHookIndices.slice(startIndex, endIndex);
    },
  },
  beforeMount() {
    // Initialize the logs array by retrieving data from localStorage
    const storedLogs = localStorage.getItem('logs');
    const storedTimestamps = localStorage.getItem('timestamps');
    // Parse and set the logs if there are stored logs in localStorage, or initialize an empty array if none found
    this.hooks = storedLogs ? JSON.parse(storedLogs) : [];
    // Parse and set the timestamps if there are stored timestamps in localStorage, or initialize an empty array if none found
    this.timestamps = storedTimestamps ? JSON.parse(storedTimestamps) : [];
    // Immediately filter the logs based on the searchTerm
    this.filterHooks();
  },
  created() {
    // Connect to the Socket.io server and listen for incoming hooks
    socket.on('webhook', (hook) => {
      // Generate a unique ID for the event based on the current length of the hooks array
      const generatedHookId = this.hooks.length;
      // Store the event in the hooks array without modifying the original event JSON
      this.hooks.push({ ...hook });
      // Get the timestamp for the hook
      const timestamp = Date.now();
      // Format the timestamp and store it in the separate timestamps array
      const formattedTimestamp = this.formatTimestamp(timestamp);
      this.timestamps.push({ id: generatedHookId, timestamp: formattedTimestamp });
      // Update filtered hooks when new data arrives
      this.filterHooks();
      // Save the updated logs and timestamps to localStorage
      localStorage.setItem('logs', JSON.stringify(this.hooks));
      localStorage.setItem('lastHookId', generatedHookId); // Store the generatedHookId in local storage
      localStorage.setItem('timestamps', JSON.stringify(this.timestamps));
    });
    // Retrieve the last assigned ID from localStorage or start at 0
    this.lastHookId = parseInt(localStorage.getItem('lastHookId')) || 0;
  }
});
