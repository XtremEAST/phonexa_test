'use strict';

document.addEventListener('DOMContentLoaded', onDocumentReady);

function onDocumentReady() {
    var userFormTmpl;
    var specFormTmpl;
    var userInfoTmpl;
    var regardsTmpl;

    var userFormData = {};
    var specFormData = {};

    var editMode = false;
    var specs = JSON.stringify({
        "departments": {
            "Sales": [
                "Sales Manager",
                "Account Manager"
            ],
            "Marketing": [
                "Creative Manager",
                "Marketing Coordinator",
                "Content Writer"
            ],
            "Technology": [
                "Project Manager",
                "Software Developer",
                "PHP programmer",
                "Front End",
                "Quality Assurance"
            ]
        }
    });

    var propToAttr = {
        firstName: 'first-name',
        lastName: 'last-name',
        login: 'login',
        email: 'email',
        password: 'password',
        passwordConfirm: 'password-confirm',
        department: 'department',
        vacancy: 'vacancy'
    };

    var requiredErrorText = 'This field is required';
    var onlyLettersErrorText = 'Can contain letters only';
    var emailErrorText = 'Incorrect e-mail';
    var passwordErrorText = 'Required at least one number (0-9), uppercase and lowercase letters (a-Z) and at least one special character (!@#$%^&*~)';
    var equalPasswordErrorText = 'Must be equal to password';

    userFormTmpl = document.getElementById('user-form-template');
    specFormTmpl = document.getElementById('spec-form-template');
    userInfoTmpl = document.getElementById('user-info-template');
    regardsTmpl = document.getElementById('regards-template');

    // initUserForm();

    initSpecForm();

// init functions
    function initUserForm() {
        var userInfo;

        if (userFormTmpl) {
            appendTemplateToElement(userFormTmpl, 'body');
            addEventListenerById('click', 'user-form-submit-btn', onUserFormSubmit);
            addEventListenerByClassName('keydown', 'input', onInputKeyDown);

            if (editMode) {
                userInfo = getDataFromLocalStorage('userInfo');
                if (userInfo) {
                    fillUserForm(userInfo);
                }
            }
        }
    }

    function initSpecForm() {
        var userInfo;

        if (specFormTmpl) {
            appendTemplateToElement(specFormTmpl, 'body');
            addEventListenerById('click', 'spec-form-submit-btn', onSpecFormSubmit);
            addEventListenerByClassName('change', 'input', onSpecFromSelectChange);

            if (editMode) {
                userInfo = getDataFromLocalStorage('userInfo');
                if (userInfo) {
                    fillSpecForm(userInfo);
                } else {
                    fillDepartmentsOptions();
                }
            } else {
                fillDepartmentsOptions();
            }
        }
    }

    function initUserInfo() {
        if (userInfoTmpl) {
            appendTemplateToElement(userInfoTmpl, 'body');
            addEventListenerById('click', 'send-btn', onUserInfoSend);
            addEventListenerById('click', 'edit-btn', onUserInfoEdit);
            fillUserInfo(getUserInfo());
        }
    }

    function initRegards() {
        if (regardsTmpl) {
            appendTemplateToElement(regardsTmpl, 'body');
        }
    }


// handler functions
    function onUserFormSubmit() {
        var data = getUserFormData();
        var errors = validateUserForm(data);
        resetFormErrors('user-form');

        if (errors.length) {
            fillFormErrors('user-form', errors);
        } else {
            userFormData = data;
            unloadUserForm();
            initSpecForm();
        }
    }

    function onSpecFormSubmit() {
        var data = getSpecFormData();
        var errors = validateSpecForm(data);
        resetFormErrors('spec-form');

        if (errors.length) {
            console.log(errors);
            fillFormErrors('spec-form', errors);
        } else {
            specFormData = data;
            unloadSpecForm();
            initUserInfo();
        }
    }

    function onUserInfoSend() {
        editMode = false;
        saveDataToLocalStorage('user');
        unloadUserInfo();
        initRegards();
    }

    function onUserInfoEdit() {
        editMode = true;
        unloadUserInfo();
        initUserForm();
    }

    function onInputKeyDown(e) {
        resetInputError(e.target.getAttribute('id'));
    }

    function onSpecFromSelectChange(e) {
        var vacancySelect = document.getElementById('vacancy');
        var select = e.target;
        resetInputError(select.id);

        if (select.id === 'department') {
            fillVacanciesOptions(select.value);

            if (select.value) {
                vacancySelect.removeAttribute('disabled');
            } else {
                vacancySelect.setAttribute('disabled', 'disabled');
                vacancySelect.value = '';
            }
        }
    }


// form validate functions
    function validateUserForm(data) {
        var errors = [];

        if (!data.firstName) {
            errors.push({
                field: 'firstName',
                error: requiredErrorText
            });
        } else if (!testOnlyLetters(data.firstName)) {
            errors.push({
                field: 'firstName',
                error: onlyLettersErrorText
            });
        }

        if (!data.lastName) {
            errors.push({
                field: 'lastName',
                error: requiredErrorText
            });
        } else if (!testOnlyLetters(data.lastName)) {
            errors.push({
                field: 'lastName',
                error: onlyLettersErrorText
            });
        }

        if (!data.login) {
            errors.push({
                field: 'login',
                error: requiredErrorText
            });
        }

        if (!data.email) {
            errors.push({
                field: 'email',
                error: requiredErrorText
            });
        } else if (!testEmail(data.email)) {
            errors.push({
                field: 'email',
                error: emailErrorText
            });
        }

        if (!data.password) {
            errors.push({
                field: 'password',
                error: requiredErrorText
            });
        } else if (!testPassword(data.password)) {
            console.log(data.password);
            errors.push({
                field: 'password',
                error: passwordErrorText
            });
        } else {
            if (data.password !== data.passwordConfirm) {
                errors.push({
                    field: 'passwordConfirm',
                    error: equalPasswordErrorText
                });
            }
        }

        return errors;
    }

    function validateSpecForm(data) {
        var errors = [];

        if (!data.department) {
            errors.push({
                field: 'department',
                error: requiredErrorText
            });
        }

        if (!data.vacancy) {
            errors.push({
                field: 'vacancy',
                error: requiredErrorText
            });
        }

        return errors;
    }

    function getFormData(id) {
        var form = document.getElementById(id);

        if (form) {
            return new FormData(form);
        }
        return new FormData();
    }

    function testOnlyLetters(value) {
        return /^[A-Za-z\u0430-\u044f]+$/.test(value);
    }

    function testEmail(value) {
        return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
    }

    function testPassword(value) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*~])/.test(value);
    }

// fill form errors functions
    function fillFormErrors(id, errors) {
        var form = document.getElementById(id);

        if (form) {
            errors.forEach(function (error) {
                var inputWrapper = document.getElementById(propToAttr[error.field]).parentElement.parentElement;
                var errorElement = document.createElement('p');
                errorElement.classList.add('error');
                errorElement.textContent = error.error;
                inputWrapper.append(errorElement);
                inputWrapper.classList.add('invalid');
            });
        }
    }

    function resetFormErrors(id) {
        var form = document.getElementById(id);

        if (form) {
            var inputWrappers = form.getElementsByClassName('input-wrapper');

            for (var i = 0; i < inputWrappers.length; i++) {
                removeError(inputWrappers[i])
            }
        }
    }

    function resetInputError(id) {
        var input = document.getElementById(id);
        removeError(input.parentElement.parentElement);
    }

    function removeError(inputWrapper) {
        var errorElements = inputWrapper.getElementsByClassName('error');
        inputWrapper.classList.remove('invalid');

        if (errorElements.length) {
            for (var i = 0; i < errorElements.length; i++) {
                inputWrapper.removeChild(errorElements[i]);
            }
        }
    }


// fill form functions
    function fillUserForm(userInfo) {
        var userForm = document.getElementById('user-form');

        if (userForm) {
            document.getElementById('first-name').value = userInfo.firstName;
            document.getElementById('last-name').value = userInfo.lastName;
            document.getElementById('login').value = userInfo.login;
            document.getElementById('email').value = userInfo.email;
            document.getElementById('company').value = userInfo.company;
            document.getElementById('password').value = userInfo.password;
            document.getElementById('password-confirm').value = userInfo.password;
        }
    }

    function fillSpecForm(userInfo) {
        var specForm = document.getElementById('spec-form');

        fillDepartmentsOptions();
        fillVacanciesOptions(userInfo.department);

        if (specForm) {
            document.getElementById('department').value = userInfo.department;
            document.getElementById('vacancy').value = userInfo.vacancy;
        }
    }

    function fillUserInfo(userInfo) {
        var userInfoElement = document.getElementById('user-info');

        if (userInfoElement) {
            document.getElementById('user-info-name').textContent = userInfo.firstName + ' ' + userInfo.lastName;
            document.getElementById('user-info-login').textContent = userInfo.login;
            document.getElementById('user-info-email').textContent = userInfo.email;
            document.getElementById('user-info-company').value = userInfo.company;
            document.getElementById('user-info-department').value = userInfo.department;
            document.getElementById('user-info-vacancy').value = userInfo.vacancy;
        }
    }

    function fillDepartmentsOptions() {
        document.getElementById('department').innerHTML = '';
        appendOptionToSelect('department', '', 'Department');

        getDepartments().forEach(function (department) {
            appendOptionToSelect('department', department, department);
        });
    }

    function fillVacanciesOptions(department) {
        document.getElementById('vacancy').innerHTML = '';
        appendOptionToSelect('vacancy', '', 'Vacancy');

        if (department) {
            getDepartmentVacancies(department).forEach(function (vacancy) {
                appendOptionToSelect('vacancy', vacancy, vacancy);
            });
        }
    }

    function getDepartments() {
        return Object.keys(JSON.parse(specs).departments);
    }

    function getDepartmentVacancies(department) {
        return JSON.parse(specs).departments[department];
    }

    function appendOptionToSelect(selectId, value, text) {
        var option;
        var select = document.getElementById(selectId);

        if (select) {
            option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            select.append(option);
        }
    }


// unload functions
    function unloadUserForm() {
        removeEventListenerById('click', 'user-form-submit-btn', onUserFormSubmit);
        removeEventListenerByClassName('keydown', 'input', onInputKeyDown);
        removeElementById('user-form-modal');
    }

    function unloadSpecForm() {
        removeEventListenerById('click', 'spec-form-submit-btn', onSpecFormSubmit);
        removeEventListenerByClassName('change', 'input', onSpecFromSelectChange);
        removeElementById('spec-form-modal');
    }

    function unloadUserInfo() {
        removeEventListenerById('click', 'send-btn', onUserInfoSend);
        removeEventListenerById('click', 'edit-btn', onUserInfoEdit);
        removeElementById('user-info-modal');
    }


// functions getting user info
    function getUserFormData() {
        var data = getFormData('user-form');
        return {
            firstName: data.get('first-name') || '',
            lastName: data.get('last-name') || '',
            login: data.get('login') || '',
            email: data.get('email') || '',
            company: data.get('company') || '',
            password: data.get('password') || '',
            passwordConfirm: data.get('password-confirm') || '',
        };
    }

    function getSpecFormData() {
        var data = getFormData('spec-form');
        return {
            department: data.get('department') || '',
            vacancy: data.get('vacancy') || ''
        }
    }

    function getUserInfo() {
        var userInfo = {};

        Object.keys(userFormData).forEach(function (key) {
            userInfo[key] = userFormData[key];
        });

        Object.keys(specFormData).forEach(function (key) {
            userInfo[key] = specFormData[key];
        });

        return userInfo;
    }


// local storage functions
    function saveDataToLocalStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function getDataFromLocalStorage(key) {
        return JSON.parse(localStorage.getItem(key));
    }


// DOM functions
    function appendTemplateToElement(templateElement, elementId) {
        document.getElementById(elementId).appendChild(templateElement.content.cloneNode(true));
    }

    function removeElementById(id) {
        var element = document.getElementById(id);
        element.parentElement.removeChild(element);
    }

    function addEventListenerById(e, id, handler) {
        document.getElementById(id).addEventListener(e, handler, false);
    }

    function addEventListenerByClassName(e, className, handler) {
        var elements = document.getElementsByClassName(className);

        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener(e, handler, false);
        }
    }

    function removeEventListenerById(e, id, handler) {
        document.getElementById(id).removeEventListener(e, handler);
    }

    function removeEventListenerByClassName(e, className, handler) {
        var elements = document.getElementsByClassName(className);

        for (var i = 0; i < elements.length; i++) {
            elements[i].removeEventListener(e, handler);
        }
    }
}
