document.addEventListener("DOMContentLoaded", () => {
  const newExpenseBtn = document.querySelector(".new-expense");
  const newCategoryBtn = document.querySelector(".manage-categories");
  const expenseForm = document.querySelector(".new-expense-form");
  const categoryForm = document.querySelector(".new-category-form");

  const expensesAllBtn = document.querySelector(".expenses-all-btn");
  const expensesCatBtn = document.querySelector(".expenses-cat-btn");
  const expensesAll = document.querySelector(".expenses-all");
  const expensesByCat = document.querySelector(".expenses-by-cat");
  const addExpenseBtn = document.querySelector(".add-new-ex-btn");
  const descInput = document.querySelector(".new-expense-form .description");
  const amountInput = document.querySelector(".new-expense-form .amount");
  const allExpensesTable = document.querySelector(".expense-table");
  const byCategoryContainer = document.querySelector(".expenses-by-cat");

  const categoryInput = document.querySelector(".new-category-form .name");
  const budgetInput = document.querySelector(".new-category-form .budget");
  const addCategoryBtn = document.querySelector(".add-new-cat-btn");
  const categorySelect = document.querySelector(".new-expense-form .category");
  const cardsContainer = document.querySelector(".cards-container");
  const deleteCategorySelect = document.querySelector(".delete-category");
  const deleteCategoryBtn = document.querySelector(".delete-cat-btn");


  const STORAGE_KEYS = {
  categories: "travelTracker_categories",
  expenses: "travelTracker_expenses"
};

// hide forms upon loading the page
  expenseForm.style.display = "none";
  categoryForm.style.display = "none";
  expensesByCat.style.display = "none";
  expensesByCat.style.display = "none";

  // toggle the new expense form, do not show new category form.
  newExpenseBtn.addEventListener("click", () => {
  expenseForm.style.display =
      expenseForm.style.display === "none" ? "block" : "none";
  categoryForm.style.display = "none";
  });
  // open/close 'new category' form, do not show 'new expense' form.
   newCategoryBtn.addEventListener("click", () => {
    categoryForm.style.display =
      categoryForm.style.display === "none" ? "block" : "none";
    expenseForm.style.display = "none";
  });
  // Switch between 'all expenses' and 'expenses by category' tables
  expensesAllBtn.addEventListener("click", () => {
    expensesAll.style.display = "block";
    expensesByCat.style.display = "none";
    expensesAllBtn.classList.add("active");
    expensesCatBtn.classList.remove("active");
  });

  expensesCatBtn.addEventListener("click", () => {
    expensesAll.style.display = "none";
    expensesByCat.style.display = "block";
    expensesCatBtn.classList.add("active");
    expensesAllBtn.classList.remove("active");
  });

  // take the input values for new category
  addCategoryBtn.addEventListener("click", () => {
    const name = categoryInput.value.trim();
    const budget = parseFloat(budgetInput.value.trim());
    if (!name || isNaN(budget)) {
      return alert("Please enter both category name and valid budget.");
    }
  
    // Check if category already exists
    const exists = categories.some(
      (cat) => cat.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) return alert("This category already exists.");

    // if the category does not yet exist, push to storage, save and render updated cat in the browser
    const newCategory = { name, budget };
    categories.push(newCategory);
    saveCategories(categories);
    renderCategoryDropdowns();
    showFeedback(`Category "${name}" added successfully!`);
    // reset fields
    categoryInput.value = "";
    budgetInput.value = "";
  });

  // take the value of selected category to delete
  deleteCategoryBtn.addEventListener("click", () => {
  const selectedCat = deleteCategorySelect.value;
  if (!selectedCat) return alert("No category selected.");
  else { showConfirmation(
  `Are you sure you want to delete "${selectedCat}"?`,
  () => deleteCategory(selectedCat)
);}

});


// a helper to delete a category
function deleteCategory(category) {
  // remove selected category from storage list, save and render updated list
    categories = categories.filter((c) => c.name !== category);
    saveCategories(categories);
    renderCategoryDropdowns();

    // Remove summary card for deleted category
const card = document.getElementById(category.toLowerCase().replace(/\s+/g, "-"));
if (card) card.remove();

// Remove any category tables for the deleted category
const tableContainer = byCategoryContainer.querySelector(`.table-${category.toLowerCase().replace(/\s+/g, "-")}`)?.closest(".table-container");
if (tableContainer) tableContainer.remove();

// Also remove related expenses for that category
expenses = expenses.filter(exp => exp.category !== category);
saveExpenses(expenses);

// Refresh main tables and summary
renderAllExpensesTable();
renderCategoryTables();
updateSummaryCards();
showFeedback(`Category "${category}" deleted successfully!`);
}

// a helper function to display feedback for the user upon successful action
function showFeedback(message, type = "success") {
  const container = document.getElementById("feedbackContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `feedback feedback-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Fade in
  setTimeout(() => toast.classList.add("visible"), 100);

  // Auto remove after 3s
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// a helper to show a deletion cofirmation modal on the screen 
function showConfirmation(message, onConfirm) {
  const modal = document.getElementById('confirmModal');
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  const cancelBtn = document.getElementById('cancelDeleteBtn');
  const text = modal.querySelector('p');

  text.textContent = message;
  modal.style.display = 'flex';

  // Clean up previous listeners
  const newConfirm = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);

  const newCancel = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

  newConfirm.addEventListener('click', () => {
    modal.style.display = 'none';
    onConfirm(); // execute passed function
  });

  newCancel.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
}

// a helper function to refresh the tables
function renderAllExpensesTable() {
  const tbody = allExpensesTable.querySelector("tbody");
  tbody.innerHTML = ""; // clear table
  expenses.forEach((exp) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td data-label="Date">${exp.date}</td>
      <td data-label="Description">${exp.description}</td>
      <td data-label="Category">${exp.category}</td>
      <td data-label="Amount">$${exp.amount.toFixed(2)}</td>
      <td data-label="Budget Change">${exp.budgetChange}</td>
      <td>
        <button class="edit-expense" data-id="${exp.id}">Edit</button>
        <button class="delete-expense" data-id="${exp.id}">Delete</button>
      </td>
    `;
  });
}

// a helper function to refresh the expenses by category tables
function renderCategoryTables() {
  // clear all category tables first
  const containers = byCategoryContainer.querySelectorAll(".table-container");
  containers.forEach((c) => c.remove());

  // group expenses by category
  const grouped = {};
  expenses.forEach((exp) => {
    if (!grouped[exp.category]) grouped[exp.category] = [];
    grouped[exp.category].push(exp);
  });

  // render one table per category
  Object.keys(grouped).forEach((cat) => {
    const container = document.createElement("div");
    container.classList.add("table-container");

    const title = document.createElement("span");
    title.classList.add("table-title");
    title.textContent = cat;

    const table = document.createElement("table");
    table.classList.add(`table-${cat.toLowerCase().replace(/\s+/g, "-")}`);
    table.innerHTML = `
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Category</th>
          <th>Amount</th>
          <th>Budget change</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");
    grouped[cat].forEach((exp) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td data-label="Date">${exp.date}</td>
        <td data-label="Description">${exp.description}</td>
        <td data-label="Category">${exp.category}</td>
        <td data-label="Amount">$${exp.amount.toFixed(2)}</td>
        <td data-label="Budget Change">${exp.budgetChange}</td>
        <td>
          <button class="edit-expense" data-id="${exp.id}" data-category="${cat}">Edit</button>
          <button class="delete-expense" data-id="${exp.id}" data-category="${cat}">Delete</button>
        </td>
      `;
    });

    container.appendChild(title);
    container.appendChild(table);
    byCategoryContainer.appendChild(container);
  });
}

   // to load existing categories from local storage, default if none
   function loadCategories() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.categories));
    if (Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    // Default starter categories with their budgets
    return [
      { name: "Transportation", budget: 300 },
      { name: "Housing", budget: 800 },
      { name: "Food", budget: 400 },
      { name: "Entertainment", budget: 200 }
    ];
  }
  // to set updated list of categories in the local storage
  function saveCategories(list) {
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(list));
  }

  let categories = loadCategories();

  // to populate the select elements with options from categories saved in the storage
  function renderCategoryDropdowns() {
    categorySelect.innerHTML = "";
    deleteCategorySelect.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a category";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.hidden = true;
    categorySelect.appendChild(placeholder);

    const placeholder1 = document.createElement("option");
    placeholder1.value = "";
    placeholder1.textContent = "Select a category";
    placeholder1.disabled = true;
    placeholder1.selected = true;
    placeholder1.hidden = true;
    deleteCategorySelect.appendChild(placeholder1);

    categories.forEach((cat) => {
      const option1 = document.createElement("option");
      option1.value = cat.name;
      option1.textContent = cat.name;
      categorySelect.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = cat.name;
      option2.textContent = cat.name;
      deleteCategorySelect.appendChild(option2);
    });
  }
  renderCategoryDropdowns();

  // functions to load and save expenses to/from storage
  function loadExpenses() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.expenses)) || [];
  }

  function saveExpenses(list) {
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(list));
  }

  let expenses = loadExpenses();


  // check if a summary card for the expense category (parameter) exits, if not, create new card
    function ensureSummaryCard(categoryName) {
    const id = categoryName.toLowerCase().replace(/\s+/g, "-");
    let card = document.getElementById(id);
    if (card) return card;

    const container = document.querySelector(".cards-container");
    card = document.createElement("div");
    card.classList.add("card");
    card.id = id;

    const category = categories.find((c) => c.name === categoryName);
    const budget = category ? category.budget : 0;

    card.innerHTML = `
    <div class="info">
      <span class="title">${categoryName}</span>
      <span class="evaluation">Budget: $${budget.toFixed(2)}</span>
      <span class="amount-spent">Spent: $0.00</span>
      <span class="percentage">0%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
    `;
    container.appendChild(card);

    return card;
  }
    
  // 
  function updateSummaryCards() {
    // map for storing each category with its current budget
    const totals = {};
    // loop through all expenses and add up all expenses amounts in each category
    expenses.forEach((ex) => {
        // if category does not exist, start from 0, otherwise add up the amounts
        totals[ex.category] = (totals[ex.category] || 0) + ex.amount;
    });

    // remove cards for categories with no expenses anymore
  const existingCards = Array.from(document.querySelectorAll(".cards-container .card"));
  existingCards.forEach((card) => {
    const catName = card.querySelector(".title").textContent;
    const stillExists = totals.hasOwnProperty(catName);
    if (!stillExists) {
      card.remove();
    }
  });
    // loop throgh each category in totals
    Object.keys(totals).forEach((cat) => {
        // find matching category in the saved list
        const category = categories.find((c) => c.name === cat);
        // extract it's budget or set it to 0.
        const budget = category ? category.budget : 0;
        // set total amount spent for this category
        const spent = totals[cat];
        // calculate the percent of budget used
        const percent = budget ? (spent / budget) * 100 : 0;
        // find or create new card for the category of new expenses
        const card = ensureSummaryCard(cat);
        // update values in the categories card
        card.querySelector(".amount-spent").textContent = `Spent: $${spent.toFixed(2)}`;
        card.querySelector(".evaluation").textContent = `Budget: $${budget.toFixed(2)}`;
        card.querySelector(".percentage").textContent = `${percent.toFixed(1)}%`;

        // styling depending on the percentage of budget used
        const fill = card.querySelector(".progress-fill");
        fill.style.width = `${percent}%`;
        fill.style.width = `${Math.min(percent, 100)}%`;
        if (percent <= 80) {
            fill.style.backgroundColor = "#4caf50"; 
        } else if (percent <= 100) {
            fill.style.backgroundColor = "#ff9800"; 
        } else {
            fill.style.backgroundColor = "#f44336";
        }
  }); 
    // Calculate total budget and total spent
const totalBudget = categories.reduce((sum, c) => sum + c.budget, 0);
const totalSpent = Object.values(totals).reduce((sum, val) => sum + val, 0);
const totalRemaining = totalBudget - totalSpent;

// Update total summary section
const totalInfo = document.querySelector(".total-info");
if (totalInfo) {
  totalInfo.textContent = `Total Budget: $${totalBudget.toFixed(2)} | Spent: $${totalSpent.toFixed(2)} | Remaining: $${totalRemaining.toFixed(2)}`;
}


}

    // event listener for add new expense button
    addExpenseBtn.addEventListener("click", () => {
    const description = descInput.value.trim();
    const category = categorySelect.value;
    const amount = parseFloat(amountInput.value);

    if (!description || !category || isNaN(amount)) {
      return alert("Please fill all fields correctly.");
    }

    const date = new Date().toLocaleDateString();
    // check if category exist
    const categoryData = categories.find((c) => c.name === category);
    // current category budget
    const categoryBudget = categoryData ? categoryData.budget : 0;
    // calculate how much already spent in this category before the new expense
    const spentBefore = expenses.filter((e) => e.category === category).reduce((sum, e) => sum + e.amount, 0);
    // add the new expense amount to total spent amount in the category
    const totalSpent = spentBefore + amount;

    // compute remaining budget
    const remaining = categoryBudget - totalSpent;
    // prepare new expense object with all needed values for the table input
    const expense = {
        id: Date.now(), // unique ID
        date,
        description,
        category,
        amount,
        budgetChange: `$${remaining.toFixed(2)} left`
    };
    // save new expenses in the local storage
    expenses.push(expense);
    saveExpenses(expenses);
    
    renderAllExpensesTable();
    renderCategoryTables();
    updateSummaryCards();
    showFeedback(`Expense "${description}" added under ${category}.`);
    // clean input fields
    descInput.value = "";
    amountInput.value = "";
    categorySelect.selectedIndex = 0;
  });
    // load saved data from the storage on page refresh
renderAllExpensesTable();
renderCategoryTables();
updateSummaryCards();


document.body.addEventListener("click", (e) => {
  const isEdit = e.target.classList.contains("edit-expense");
  const isDelete = e.target.classList.contains("delete-expense");
  const isSave = e.target.classList.contains("save-expense");
  const isCancel = e.target.classList.contains("cancel-edit");

  if (!isEdit && !isDelete && !isSave && !isCancel) return;

  const row = e.target.closest("tr");
  if (!row) return;
  // find the expense using its unique id
  const expenseId = +e.target.dataset.id;
  const expense = expenses.find((ex) => ex.id === expenseId);
  if (!expense) return; 

  // DELETE
  if (isDelete) {
    showConfirmation(
  "Are you sure you want to delete this expense?",
  () => {
    expenses = expenses.filter(ex => ex.id !== expenseId);
      saveExpenses(expenses);
      renderAllExpensesTable();
      renderCategoryTables();
      updateSummaryCards();
      showFeedback(`Expense "${expense.description}" deleted successfully.`);
    return;}
);}

  // EDIT INLINE
  if (isEdit) {
    const descCell = row.children[1];
    const catCell = row.children[2];
    const amtCell = row.children[3];
    const actionsCell = row.children[5];

    descCell.innerHTML = `<input type="text" value="${expense.description}" class="edit-desc">`;

    const select = document.createElement("select");
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.name;
      opt.textContent = cat.name;
      if (cat.name === expense.category) opt.selected = true;
      select.appendChild(opt);
    });
    select.classList.add("edit-cat");
    catCell.innerHTML = "";
    catCell.appendChild(select);

    amtCell.innerHTML = `<input type="number" step="0.01" value="${expense.amount}" class="edit-amt">`;

    actionsCell.innerHTML = `
      <button class="save-expense" data-id="${expense.id}" data-category="${expense.category}">Save</button>
      <button class="cancel-edit" data-id="${expense.id}" data-category="${expense.category}">Cancel</button>
    `;
  }

  // SAVE EDIT
  if (isSave) {
    const desc = row.querySelector(".edit-desc").value.trim();
    const cat = row.querySelector(".edit-cat").value;
    const amt = parseFloat(row.querySelector(".edit-amt").value);
    if (!desc || !cat || isNaN(amt)) return alert("Please fill all fields correctly.");

    const expense = expenses.find(ex => ex.id === expenseId);
    expense.description = desc;
    expense.category = cat;
    expense.amount = amt;

    const categoryData = categories.find((c) => c.name === cat);
    const spentBefore = expenses
      .filter((e) => e.category === cat && e.id !== expenseId)
      .reduce((sum, e) => sum + e.amount, 0);
    const remaining = categoryData ? categoryData.budget - (spentBefore + amt) : 0;
    expense.budgetChange = `$${remaining.toFixed(2)} left`;

    saveExpenses(expenses);
    renderAllExpensesTable();
    renderCategoryTables();
    updateSummaryCards();
    showFeedback(`Expense "${expense.description}"updated successfully.`);
  }

  // CANCEL EDIT
  if (isCancel) {
    renderAllExpensesTable();
    renderCategoryTables();
    updateSummaryCards();
  }
});
renderAllExpensesTable();
renderCategoryTables();
updateSummaryCards();
});

