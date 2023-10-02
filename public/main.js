// public/main.js
const socket = io();

new Vue({
  el: '#app',
  data: {
    hooks: [], // Store received hooks here
    searchTerm: '',
    filteredHooks: [], // Store filtered hooks here,
    lastHookId: null,
    filteredHookIndices: [], // Store filtered hook indices here
  },
  methods: {
    filterHooks() {
      // Filter hooks based on searchTerm and store the filtered indices
      this.filteredHookIndices = this.hooks
        .map((hook, index) => ({
          hook,
          index,
        }))
        .filter(({ hook }) => {
          const searchTerm = this.searchTerm.toLowerCase();
          // Check if searchTerm is present as a substring in any property of the webhook data
          for (const key in hook) {
            const value = hook[key];
            return value && typeof value === 'string' && value.toLowerCase().includes(searchTerm);
          }
          return false;
        })
        .map(({ index }) => index);
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
  },
  beforeMount() {
    // Initialize the logs array by retrieving data from localStorage
    const storedLogs = localStorage.getItem('logs');
    const storedTimestamps = localStorage.getItem('timestamps');

    if (storedLogs) {
      // Parse and set the logs if there are stored logs in localStorage
      this.hooks = JSON.parse(storedLogs);
    } else {
      // Initialize an empty array if no logs are found in localStorage
      this.hooks = [];
    }

    if (storedTimestamps) {
      // Parse and set the timestamps if there are stored timestamps in localStorage
      // This is where we retrieve the formatted timestamps
      this.timestamps = JSON.parse(storedTimestamps);
    } else {
      // Initialize an empty array if no timestamps are found in localStorage
      this.timestamps = [];
    }

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
