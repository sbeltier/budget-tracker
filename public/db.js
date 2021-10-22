/* * * *
* 
* *
* * * Start Index DB Code
* *
* 
* * * */

// Open indexDB

let db;

const request = window.indexedDB.open("budgetData", 1);

// Create Object Store
request.onupgradeneeded = ({ target }) => {
  db = target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('TransactionStore', { autoIncrement: true });
  }

}

// If Error:
request.onerror = function (e) {
    console.log(`Error:`+ e.target.errorCode);
  };

  function checkDatabase() {
    console.log('check db invoked');
  
    let transaction = db.transaction(['TransactionStore'], 'readwrite');
    const store = transaction.objectStore('TransactionStore');
  
    // Get all records from store and set to a variable
    const getAll = store.getAll();
  
    // If the request was successful
    getAll.onsuccess = function () {
      // If there are items in the store, we need to bulk add them when we are back online
      if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          },
        })
          .then((response) => response.json())
          .then((res) => {
            // If our returned response is not empty
            if (res.length !== 0) {
              // Open another transaction to BudgetStore with the ability to read and write
              transaction = db.transaction(['TransactionStore'], 'readwrite');
  
              // Assign the current store to a variable
              const currentStore = transaction.objectStore('TransactionStore');
  
              // Clear existing entries because our bulk add was successful
              currentStore.clear();
              console.log('Clearing store 🧹');
            }
          });
      }
    };
  }

// Open Transaction to access the transactions objectStore and budgetIndex
request.onsuccess = function (e) {
    console.log('success');
    db = e.target.result;
  
    // Check if app is online before reading from db
    if (navigator.onLine) {
      console.log('Backend online! 🗄️');
      checkDatabase();
    }
  };


  // Add data to budgetStore
  const saveRecord = (record) => {
    console.log('Save record invoked');
    const transaction = db.transaction(['TransactionStore'], 'readwrite');
    const store = transaction.objectStore("TransactionStore")
    store.add(record)

  };

// Listen for app coming back online
window.addEventListener('online', checkDatabase);