// UI CONTROLLER

var UIcontroller = (function () {

    var formatNumber = function(num, type) {
        var splitedNum, integer, decimal, type, sign;
        num = Math.abs(num);
        num = num.toFixed(2);

        splitedNum = num.split('.');

        integer = splitedNum[0];

        decimal = splitedNum[1];

        if(integer.length > 3) {
            integer = integer.substr(0, integer.length - 3) + ',' + integer.substr(integer.length -3, 3);
        }

        type === 'exp' ? sign = '-' : sign = '+';

        return sign + ' ' + integer + '.' + decimal;
    }

    return {
        getValues: function () {
            return {
                operation: document.getElementById('transferType').value,
                description: document.getElementById('description').value,
                value: parseFloat(document.getElementById('currentValue').value)
            }
        },

        addDOMitem: function (obj, type) {
            var html, newHtml, element;

            if (type === 'inc') {
                html = '<div class="single-transfer income-item" id="income-item-%id%"><span>%description%</span><div><span class="income-amount">%value%</span><button class="delete-item income-delete">X</button></div></div>';
                element = 'income-list';
            } else if (type === 'exp') {
                html = '<div class="single-transfer expenses-item" id="expenses-item-%id%"><span>%description%</span><div><span class="expenses-amount">%value%</span><span class="expenses-item-percentage expensesPercentage"></span></span><button class="delete-item expenses-delete">X</button></div></div>';
                element = 'expenses-list';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.getElementById(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteDOMitem: function (selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll('#description' + ',' + '#currentValue');
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (element, index, array) {
                element.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;

            if(obj.budget > 0) {
                type = 'inc'
            } else {
                type = 'exp'
            }

            document.getElementById('current-budget').textContent = formatNumber(obj.budget, type) ;
            document.getElementById('incomeCounter').textContent = formatNumber(obj.totalIncome, 'inc');
            document.getElementById('expensesCounter').textContent = formatNumber(obj.totalExpenses, 'exp');


            if (obj.percentage > 0) {
                document.getElementById('expensesPercentage').textContent = obj.percentage + '%';
            } else {
                document.getElementById('expensesPercentage').textContent = '--';
            }
        },

        displayPercentages: function(percentages) {

            var DOMelements = document.querySelectorAll('.expenses-item-percentage');

            var forEachNode = function(list, callback) {
                for(var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            }

            forEachNode(DOMelements, function(current, index){
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
                

            })

        },

        displayDate: function() {
            var now, year, month;

            now = new Date();

            year = now.getFullYear();

            month = now.getMonth();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            document.getElementById('header__date').textContent = months[month] + ' ' + year;

        },

        changedType: function() {
            var value = document.getElementById('transferType').value;

            var elem = document.getElementById('controls').classList;

            if(value == 'exp') {
                elem.remove('type-income')
                elem.add('type-expense')
            } if (value === 'inc') {
                elem.remove('type-expense');
                elem.add('type-income');
            }

        }
    }


})();




// DATA CONTROLLER

var DataController = (function (UICtrl, dataCtrl) {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calcTotal = function (type) {
        var sum = 0;

        data.allItems[type].forEach(function (element) {
            sum += element.value;
        })

        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: [],
            exp: []
        },
        currentBudget: 0,
        persentage: - 1,
    }


    return {
        // create addItem method to retrieve data
        addItem: function (type, description, value) {
            var newItem, ID;
            ID = 0;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'inc') {
                newItem = new Income(ID, description, value);
            } else if (type === 'exp') {
                newItem = new Expense(ID, description, value);
            }

            // write data from newItem to budget structure with ID defined
            data.allItems[type].push(newItem);
            return newItem;

        },

        calculateBudget: function () {

            calcTotal('exp');
            calcTotal('inc');

            data.currentBudget = (data.totals.inc - data.totals.exp);

            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percentage = - 1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (element) {
                element.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (element) {
                return element.getPercentage();

            })

            return allPercentages;
        },

        getBudget: function () {
            return {
                budget: data.currentBudget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage,
            }
        },

        deleteItem: function (type, id) {
            var idsArray, index;

            idsArray = data.allItems[type].map(function (element) {
                return element.id
            });

            index = idsArray.indexOf(id);

            console.log('index is ' + index);
            console.log('id is ' + id);
            console.log(idsArray);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        test: function () {
            return data;
        }
    }


})(UIcontroller, DataController);





// EVENT CONTROLLER

var EventController = (function (UICtrl, dataCtrl) {
    var inputValues, newItem;

    var newTransfer = function () {
        inputValues = UIcontroller.getValues();

        if (inputValues.description !== "" && !isNaN(inputValues.value) && inputValues.value > 0) {

            newItem = DataController.addItem(inputValues.operation, inputValues.description, inputValues.value);

            UIcontroller.addDOMitem(newItem, inputValues.operation);

            UIcontroller.clearFields();

            updateBudget();

            updatePercentages();

        } else {
            alert('Check if all thee fields are correct!')
        }


    };

    var updateBudget = function () {
        var budget;

        DataController.calculateBudget();

        budget = DataController.getBudget();

        UIcontroller.displayBudget(budget);
    };

    var deleteTransfer = function (event) {
        var itemID, splitID, type, id;

        console.log('I\'m inside');


        if (event.target.classList.contains('delete-item')) {
            itemID = event.target.parentNode.parentNode.id;
            splitID = itemID.split('-');
            type = splitID[0].slice(0, 3);
            id = +splitID[2];

            DataController.deleteItem(type, id);

            UIcontroller.deleteDOMitem(itemID);

            updateBudget();

        } else {
            console.log('Didn\'t work');
        }

    };

    var updatePercentages = function () {

        DataController.calculatePercentages();

        var percentages = DataController.getPercentages();

        UIcontroller.displayPercentages(percentages)

        console.log(percentages);
    };

    document.getElementById('save').addEventListener('click', newTransfer);
    document.getElementById('transfers-list').addEventListener('click', deleteTransfer);
    document.addEventListener('keypress', function (e) {
        if (e.keyCode === 13) {
            newTransfer();
        }
    });
    document.getElementById('transferType').addEventListener('change', UIcontroller.changedType);




})(UIcontroller, DataController);

UIcontroller.changedType();
UIcontroller.displayDate();