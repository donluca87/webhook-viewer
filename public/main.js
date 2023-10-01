// public/main.js
const socket = io();

new Vue({
  el: '#app',
  data: {
    hooks: [], // Store received hooks here
    searchTerm: '',
    filteredHooks: [], // Store filtered hooks here
  },
  methods: {
    filterHooks() {
      // Filter hooks based on searchTerm
      this.filteredHooks = this.hooks.filter((hook) => {
        const searchTerm = this.searchTerm.toLowerCase();

        // Check if searchTerm is present as a substring in any property of the webhook data
        for (const key in hook) {
          const value = hook[key];
          if (value && typeof value === 'string' && value.toLowerCase().includes(searchTerm)) {
            return true;
          }
        }
        return false;
      });
    },
    clearSearch() {
      this.searchTerm = ''; // Clear the search term
      this.filteredHooks = this.hooks; // Show all logs
    },
    // Method to clear localStorage
    clearLocalStorage() {
      localStorage.removeItem('logs'); // Remove logs
      localStorage.removeItem('lastHookId'); // Remove lastHookId
      this.hooks = []; // Clear the logs array in your component
      this.lastHookId = 0; // Reset the lastHookId
      this.filterHooks();
    },
  },
  beforeMount() {
    // Initialize the logs array by retrieving data from localStorage
    const storedLogs = localStorage.getItem('logs');

    if (storedLogs) {
      // Parse and set the logs if there are stored logs in localStorage
      this.hooks = JSON.parse(storedLogs);
    } else {
      // Initialize an empty array if no logs are found in localStorage
      this.hooks = [];
    }

    // Immediately filter the logs based on the searchTerm
    this.filterHooks();
  },
  created() {
    // Initialize the logs array by retrieving data from localStorage
    const storedLogs = localStorage.getItem('logs');

    if (storedLogs) {
      // Parse and set the logs if there are stored logs in localStorage
      this.hooks = JSON.parse(storedLogs);
    } else {
      // Initialize an empty array if no logs are found in localStorage
      this.hooks = [];
    }
    
    // options to format timestamp
    let options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    };
    
    // Connect to the Socket.io server and listen for incoming hooks
    socket.on('webhook', (hook) => {
      // Retrieve the last assigned ID from localStorage or start at 0
      let lastHookId = parseInt(localStorage.getItem('lastHookId')) || 0;

      // Add an ID and timestamp to the hook
      hook.id = ++lastHookId;

      // Add formated timestamp
      hook.timestamp = new Intl.DateTimeFormat('it-IT', options).format(new Date()).replace(", ", "T").replaceAll("/", "-");

      // Handle incoming hooks
      this.hooks.push(hook);

      // Update filtered hooks when new data arrives
      this.filterHooks();

      // Save the updated logs to localStorage
      localStorage.setItem('logs', JSON.stringify(this.hooks));
      localStorage.setItem('lastHookId', lastHookId);

    });
  }
});
