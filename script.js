"use strict";
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

///////////////////////////////////////////////////////
//functions

const computingUsername = function (accounts) {
  accounts.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
computingUsername(accounts);
console.log(accounts);

//displays
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__value">${mov.toFixed(2)}€</div>
        </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const computingBalance = function (acc) {
  acc.balance = acc.movements.reduce(function (acc, cur) {
    return acc + cur;
  }, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const computingSummery = function (acc) {
  const depositSum = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  console.log(depositSum);
  labelSumIn.textContent = `${depositSum.toFixed(2)}€`;

  const withdrawalSum = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(withdrawalSum).toFixed(2)}€`;

  const interestSum = acc.movements
    .filter((mov) => mov > 0)
    .map((mov) => (mov * acc.interestRate) / 100)
    .filter((mov) => mov > 1)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumInterest.textContent = `${interestSum.toFixed(2)}€`;
};
const updateUi = function (acc) {
  displayMovements(acc.movements);
  computingSummery(acc);
  computingBalance(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }
    time--;
  };
  let time = 600;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

//login
let timer;
let currentAccount;
btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  const today = new Date();
  const date = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  labelDate.textContent = date;

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;
    updateUi(currentAccount);
  }
  inputLoginUsername.value = inputLoginPin.value = "";
  inputLoginPin.blur();

  if (timer) clearInterval(timer);
  timer = startLogOutTimer();
});

////transfers
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const recieverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  if (
    amount > 0 &&
    recieverAcc &&
    currentAccount.balance >= amount &&
    recieverAcc?.username !== currentAccount.username
  ) {
    recieverAcc.movements.push(amount);
    currentAccount.movements.push(-amount);
  }
  inputTransferAmount.value = inputTransferTo.value = "";

  updateUi(currentAccount);

  clearInterval(timer);
  timer = startLogOutTimer();
});

//request a loan
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    currentAccount.movements.push(amount);
    updateUi(currentAccount);
  }
  inputLoanAmount.value = "";

  clearInterval(timer);
  timer = startLogOutTimer();
});

//close account
btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    const indexAccount = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    accounts.splice(indexAccount, 1);
    containerApp.style.opacity = 0;
    inputCloseUsername.value = inputClosePin.value = "";
  }
});

//sort button
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
