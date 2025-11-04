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
      (cat) => cat.toLowerCase() === name.toLowerCase()
    );
    if (exists) return alert("This category already exists.");

    // if the category does not yet exist, push to storage, save and render updated cat in the browser
    const newCategory = { name, budget };
    categories.push(newCategory);
    saveCategories(categories);
    renderCategoryDropdowns();

    // reset fields
    categoryInput.value = "";
    budgetInput.value = "";
    // alert the user about successfully added category
    alert(`Category "${name}" added with budget $${budget}.`);
  });

  // take the value of selected category to delete
  deleteCategoryBtn.addEventListener("click", () => {
  const selectedCat = deleteCategorySelect.value;
  if (!selectedCat) return alert("No category selected.");

  // confirm deletion
  if (!confirm(`Delete category "${selectedCat}"?`)) return;

  // remove selected category from storage list, save and render updated list
    categories = categories.filter((c) => c.name !== selectedCat);
    saveCategories(categories);
    renderCategoryDropdowns();

  // give feedback about successful deletion
  alert(`Category "${selectedCat}" deleted.`);
});


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

   // add expense to appropriate table with all it's data
  function addExpenseRow(table, expense) {
    const row = table.insertRow(-1);
    row.innerHTML = `
      <td>${expense.date}</td>
      <td>${expense.description}</td>
      <td>${expense.category}</td>
      <td>$${expense.amount.toFixed(2)}</td>
      <td>${expense.budgetChange}</td>
    `;
  }

  // check if table for the expense category (parameter) exits, if not, create new table
    function ensureCategoryTable(categoryName) {
    const id = categoryName.toLowerCase().replace(/\s+/g, "-");
    let table = document.querySelector(`.table-${id}`);
    if (table) return table;

    const container = document.createElement("div");
    container.classList.add("table-container");

    const title = document.createElement("span");
    title.classList.add("table-title");
    title.textContent = categoryName;

    table = document.createElement("table");
    table.classList.add(`table-${id}`);
    table.innerHTML = `
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Category</th>
        <th>Amount</th>
        <th>Budget change</th>
      </tr>
    `;

    container.appendChild(title);
    container.appendChild(table);
    byCategoryContainer.appendChild(container);

    return table;
  }

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
      <span class="title">${categoryName}</span>
      <span class="evaluation">Budget: $${budget.toFixed(2)}</span>
      <span class="amount-spent">Spent: $0.00</span>
      <span class="percentage">0%</span>
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
  }); }

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
        date,
        description,
        category,
        amount,
        budgetChange: `$${remaining.toFixed(2)} left`
    };
    // save new expenses in the local storage
    expenses.push(expense);
    saveExpenses(expenses);

    addExpenseRow(allExpensesTable, expense);
    const catTable = ensureCategoryTable(category);
    addExpenseRow(catTable, expense);
    ensureSummaryCard(category);
    updateSummaryCards();
    
    // clean input fields
    descInput.value = "";
    amountInput.value = "";
    categorySelect.selectedIndex = 0;

    alert(`Expense added in "${category}"!`);
  });
    // load saved data from the storage on page refresh
  expenses.forEach((exp) => {
    addExpenseRow(allExpensesTable, exp);
    const catTable = ensureCategoryTable(exp.category);
    addExpenseRow(catTable, exp);
  });

  updateSummaryCards();
});

