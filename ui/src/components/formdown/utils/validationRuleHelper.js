
export default class ValidationRuleHelper {
  static rules = {
    '!' : [(val) => val && val.length > 0, 'This field is required'],
    '>3': [(val) => val && val.length > 3, 'Value is too short'],
    'date': [ValidationRuleHelper._isDate, 'Date format is incorrect'],
    '18+' : [ValidationRuleHelper._is18Plus, 'You should be more than 18 years to use this service'],
    'future': [ValidationRuleHelper._isFuture, 'Date should be in future'],
    'address': [ValidationRuleHelper._isAddress, 'Address format is incorrect'],
    'city': [ValidationRuleHelper._isCity, 'City is not recognized'],
    'zipcode': [ValidationRuleHelper._isZipCode, 'Invalid zip code'],
    '$': [ValidationRuleHelper._isMoney, 'Money format is invalid']
  }

  static _isDate(val) {
    if (! val) {
        return false;
    }
    var valid = true;
    let date = val.replace(/[-/.]/g, '');

    var month = parseInt(date.substring(0, 2),10);
    var day   = parseInt(date.substring(2, 4),10);
    var year  = parseInt(date.substring(4, 8),10);

    let ddmm = Date.parse('1/10/2000') > Date.parse('10/1/2000');
    if (ddmm) { // Swap month and day
      let d=day; day = month; month = d;
    }

    if(isNaN(month) || isNaN(day) || isNaN(year)) return false;

    if((month < 1) || (month > 12)) valid = false;
    else if((day < 1) || (day > 31)) valid = false;
    else if(((month === 4) || (month === 6) || (month === 9) || (month === 11)) && (day > 30)) valid = false;
    else if((month === 2) && (((year % 400) === 0) || ((year % 4) === 0)) && ((year % 100) !== 0) && (day > 29)) valid = false;
    else if((month === 2) && ((year % 100) === 0) && (day > 29)) valid = false;
    else if((month === 2) && (day > 28)) valid = false;

    return valid;
  }

  static _is18Plus(val) {
    if (!ValidationRuleHelper._isDate(val)) {
      return false;
    }
    let age = (Date.now() - Date.parse(val)) / (1000 * 3600 * 24 * 365);
    return age >= 18;
  }

  static _isFuture(val) {
    if (!ValidationRuleHelper._isDate(val)) {
      return false;
    }
    return Date.parse(val) > Date.now();
  }

  static _isAddress(val) {
    if (!val) {
        return false;
    }
    var regex = /[#-/!@$]/gi;
    return !regex.test(val);
  }

  static _isCity(val) {
    return ValidationRuleHelper._isAddress(val);
  }

  static _isZipCode(val) {
    if (!val) {
        return false;
    }

    let postalCode = val.toString().trim();

    var us = new RegExp("^\\d{5}(-{0,1}\\d{4})?$");
    var ca = new RegExp(/([ABCEGHJKLMNPRSTVXY]\d)([ABCEGHJKLMNPRSTVWXYZ]\d){2}/i);

    if (us.test(postalCode.toString())) {
        return true;
    }

    if (ca.test(postalCode.toString().replace(/\W+/g, ''))) {
        return true;
    }
    return false;
  }

  static _isMoney(val) {
    if (!val) {
        return false;
    }
    let num = +val.replace(/[,$]/g,'');
    return !isNaN(num);
  }

  static rule(ruleName, value) {
    let ruleMessage = ValidationRuleHelper.rules[ruleName];
    if (!ruleMessage) {
      return "";
    }
    if (!ruleMessage[0](value)) {
      return ruleMessage[1];
    }
  }
}
