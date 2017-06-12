
class FormDownContext {
  constructor() {
    this.lineOptions = {
      'checkbox': { listSupported: true },
      'shortTextbox': { },
      'longTextbox': { },
      'textarea': { },
      'calendar': { },
      'separator': { },
      'undefined': { listSupported: true }
    }
  }

  _cleanUp(line) {
    return line.trim();
  }

  _isCommet(line) {
    return line.substr(0, 1) === '#' || line.length === 0
  }

  _setLabelValue(lineContext, lineEnding) {
    let parts = lineEnding.split(':=', 2)
    lineContext.label = parts[0].trim();
    lineContext.value = (parts[1] ||'')
      .split(',').map(p => p.trim())
      .filter(p => p.length > 0);
  }

  _checkMulti(lineContext, parts) {
    if (!parts[0]) return false;
    let firstChar = parts[0].substr(0, 1);
    if (firstChar === '*') {
      parts[0] = parts[0].substr(1, parts[0].length - 1);
      if (parts[0] === '') {
        parts.shift();
      }
      lineContext.multiple = true;
    }
  }

  _processCustom(lineContext, parts) {
    lineContext.customTag = parts[0].replace('<', '').replace('>', '');
    parts.shift();
    this._setLabelValue(lineContext, parts.join(' ').trim());
  }

  _processList(lineContext, parts) {
    let listStr = parts.join(' ');
    let soFar = (lineContext.soFar || '');
    let pair = (soFar + listStr).split(']', 2);
    if (pair.length === 1) {
      lineContext.soFar = soFar + ' ' + listStr;
      lineContext.incomplete = true;
      return;
    }
    lineContext.incomplete = undefined;
    lineContext.soFar = undefined;
    if (lineContext.lineType === 'undefined') {
      lineContext.lineType = 'list';
    }
    lineContext.list = pair[0].replace('[', '').split(',')
                          .map(i => i.trim());
    this._setLabelValue(lineContext, (pair[1] || '').trim());
  }

  _processComment(lineContext, parts) {
    this._setLabelValue(lineContext, parts.join(' '));
  }

  _processLine(lineContext, parts) {
    if (parts.legnth === 0 || !parts[0]) return;
    let options = this.lineOptions[lineContext.lineType];
    if (options.listSupported) {
      // Check for list.
      this._checkMulti(lineContext, parts);
      if (parts.length === 0) return; // Multi can remove an item from parts
      let firstChar = parts[0].substr(0, 1);
      if (firstChar === '[') {
        this._processList(lineContext, parts);
        return;
      }
      if (firstChar === '<') {
        lineContext.lineType = 'custom';
        this._processCustom(lineContext, parts);
        return;
      }
      if (lineContext.lineType === 'undefined') {
          lineContext.lineType = 'text';
      }
    }
    this._processComment(lineContext, parts);
  }

  _oneLineItem(line, pastContext) {
    // Check the first charachter.
    let parts = line.split(' ').filter(p => p.length > 0)
    let firstPart = parts[0];
    if (pastContext.incomplete) {
      // Incomplete line, so continue with the last context
      let newContext = {...pastContext};
      this._processList(newContext, parts);
      return newContext;
    };

    let name = '';
    if (firstPart.indexOf(':')>0) {
      // There is a name
      let fsplit = firstPart.split(':', 2);
      name = fsplit[0];
      if (!fsplit[1]) {
        parts.shift();
        if (parts.length === 0) return {};
        firstPart = parts[0];
      } else {
        firstPart = fsplit[1];
      }
    }

    let lineType = null;
    switch (firstPart) {
      case 'X':
      case 'O':
        // A checkbox or radio box
        lineType = 'checkbox';
        break;
      case 'D':
        lineType = 'calendar';
        break;
      case '_':
        // A short text box
        lineType = 'shortTextbox';
        break;
      case '__':
        // A long text box
        lineType = 'longTextbox';
        break;
      case '___':
        // A textarea
        lineType = 'textarea';
        break;
      case '---':
        lineType = 'separator';
        break;
      default:
        lineType = 'undefined';
    }

    if (lineType !== 'undefined') {
      parts.shift();
    }

    let lineContext = { lineType: lineType, no: pastContext.no + 1,
                        name: name };
    this._processLine(lineContext, parts);
    return lineContext;
  }

  _formControl(item) {
    let control = {
      type: item.lineType
    }
    return control;
  }

  _getKey(keys, item) {
    let k = item.name ? item.name :
                        ( (item.label || '') + '$' + (item.type || item.lineType) );
    k = k || '';
    let i=0;
    let newK = k;
    while(keys.has(newK)){ // Resolve duplicate names.
      i += 1;
      newK = k + i;
    }
    keys.add(newK);
    return newK
  }

  compile(text) {
    /*
    Compiler for formdown text
      X Are you happy? # Check box
      _ Please describe why #Text box
      __ Longer text box
      ___ Text area
      [<10, 10-20,20+] What is your age? # Dropdown one-select
      *[<10, 10-20,20+] What is your radio age? # List box multi-select
      X […] # Radiobox / multi line allowed
      O […] # Radiobox / multi line allowed
      X *[…] # Checkbox / multi line allowed
      <upload> Upload some doco (one or more)
      <address> Whats your addr? #Custom controls
      ---
      # Comments
    */
    let lines = text.split('\n').map(l => this._cleanUp(l))
                  .filter(l => !this._isCommet(l));
    let ctx = { 'no': 1 }
    let items = lines.map(l => {
            if (ctx.lineType === 'separator') { // Short circuit the rest
              return { 'lineType': 'comments', 'label': l.trim() }
            } else {
              ctx = this._oneLineItem(l, ctx);
              return ctx;
            }
          })
          .filter(i => !i.incomplete);
    let form = { controls: [] }
    let keys = new Set();
    items.forEach(item => {
      let key = this._getKey(keys, item);
      if (item.lineType === 'text' && form.controls.length === 0) {
        form.label = item.label; // This is the form label
      }
      if (item.lineType === 'text' && form.controls.length > 0) {
        let ctrl = form.controls[form.controls.length - 1];
        ctrl.comments = (ctrl.comments ? (ctrl.comments + '\n') : '') +
                          item.label;
      }
      if (item.lineType === 'comments') {
        form.comments = (form.comments ? (form.comments + '\n') : '') +
                          item.label;
      }
      if (item.lineType === 'checkbox') {
        if (item.list) { //
          form.controls.push({
            key: key,
            type: item.multiple ? 'checkboxGroup' : 'radioGroup',
            list: item.list,
            label: item.label,
            value: item.value
          });
          return;
        }
        form.controls.push({
          key: key,
          type: 'checkbox',
          label: item.label,
          value: item.value });
        return;
      }
      if (item.lineType === 'shortTextbox' || item.lineType === 'longTextbox' ||
          item.lineType === 'textarea' || item.lineType === 'calendar') {
            form.controls.push({
              key: key,
              type: item.lineType,
              label: item.label,
              value: item.value });
            return;
          }
      if (item.lineType === 'list') {
        form.controls.push({
          key: key,
          type: item.multiple ? 'multiSelect' : 'select',
          list: item.list,
          label: item.label,
          value: item.value });
        return;
      }
      if (item.lineType === 'custom') {
        form.controls.push({
          key: key,
          type: 'custom',
          customTag: item.customTag,
          label: item.label,
          value: item.value  });
        return;
      }
    });
    return form;
  }

  multiSectionCompile(formdown) {
    if (!formdown) return [];
    let sectionKeys = new Set();
    let formKeys = new Set();

    let sections = formdown.split("SECTION ");
    sections.shift();
    let allSections = sections.map(s => {
      let section = s.split("\n");
      let sectionName = section.shift().trim();
      let groups = section.join('\n').split("GROUP ");
      let comments = groups.shift();
      let forms = groups.map(g => {
        let section = g.split("\n");
        let formName = section.shift().trim();
        let form = this.compile(section.join('\n'));
        form.name = formName;
        form.parentKey = sectionName;
        form.key = this._getKey(formKeys, form);
        form.controls.forEach(c => {
          c.parentKey = form.parentKey + '.' + formName;
        })
        return form;
      })
      let sectionObj = { name: sectionName,  key: sectionName,
                comments: comments.trim(),
                forms: forms };
      section.key = this._getKey(sectionKeys, sectionObj);
      return sectionObj;
    });

    return allSections;
  }
}

export default function formdown() {
  // Export a formdown context
  return new FormDownContext()
}
