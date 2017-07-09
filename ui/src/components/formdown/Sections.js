import {React, Component} from 'react';
import DefaultTheme from './themes/DefaultTheme'

export function Section(params) {
  let section = params.section;
  const theme = params.theme;
  if (!section) return (<div></div>);
  return theme.section(section);
}

export class Sections extends Component {
  constructor() {
    super();
    // dataModel will hold the data for the model
    // dirtySet will hold list of controls that are changed
    // isSubmitted will identify whether the submit button is
    // clicked. Useful for enabling validation
    this.state = { dataModel : {}, dirtySet: new Set(), isSubmitted: false };
  }

  handleChange(event) {
    let target = event.target;
    let targetType = target.type;
    if (!targetType) return;
    let item = JSON.parse(target.getAttribute('data-item') || {});
    let parentKey = item.parentKey;
    let key = item.key.split('$')[0];
    let listItem = target.getAttribute('data-list-item') || ''
    let value = target.value;
    let dataModelKey = parentKey + '.' + key;
    switch (targetType) {
      case 'text':
      case 'select-one':
        break;
      case 'select-multiple':
        value = [].slice.call(target.selectedOptions)
          .map(o => o.value);
        break;
      case 'radio':
        value = listItem;
        break;
      case 'checkbox':
        let multiCheckbox = (target.getAttribute('data-multiple') || '') === 'true';
        if (multiCheckbox) {
          value = (this.state.dataModel[dataModelKey] || {})
          value = {...value, [listItem]: target.checked}
        } else {
          value = target.checked;
        }
        break;
      case 'file':
        let fileName = (target.value || '').replace(/\\/g,'/').split('/').pop()
        value = (this.state.dataModel[dataModelKey] || [])
        value.push({ file: fileName, uploaded: false });
        break;
      default:
    }
    let dataModel = {...this.state.dataModel, [dataModelKey]: value};
    let dirtySet = this.state.dirtySet;
    dirtySet.add(dataModelKey);
    this.setState({...this.sate, dataModel: dataModel, dirtySet: dirtySet});
  }

  getValue(item) {
    if (!item || !item.key) return {};
    let key = item.key.split('$')[0];
    let parentKey = (item.parentKey || "");
    return (this.state.dataModel[parentKey + '.' + key] || item.value || [])
  }

  getHistory(item) {
    if (!this.props.history) {
      return [];
    }
    return this.props.history[item.parentKey + '.' + (item.key || '').split('$')[0]]    
    // return [
    //   { id: 1, time: '2018/01/01', actor: 'naiem', value: 'Some value here',
    //     note: 'This was no good! Try better!'},
    //   { id: 2, time: '2018/01/01', actor: 'chili', value: 'love' }
    //   ];
  }

  validate(item) {
    if (!this._shouldValidate(item) || (!this.props.onValidate)) {
      return {hasError: false}
    }
    let errorMessage = this.props.onValidate(item);
    return {hasError: errorMessage ? true : false, message: errorMessage}
  }

  validateSection(section) {
    if (!this._shouldValidate()) {
      return {hasError: false};
    }
    // Validate every item in the section. But don't do it for undirty forms
    for(let f in section.forms) {
      for(let c in section.forms[f].controls) {
        if (this.validate(section.forms[f].controls[c]).hasError) {
          return {hasError: true};
        }
      }
    }
    return {hasError: false};
  }

  validateSections() {
    if (!this._shouldValidate()) {
      return {hasError: false}
    }
    // Validate every item in the form.
    const sections = this.props.sections;
    for (let section in sections) {
      if (this.validateSection(sections[section]).hasError) {
        return {hasError: true}
      }
    }
    return {hasError: false}
  }

  _shouldValidate(item) {
    return this.state.isSubmitted ||
        (item && this.state.dirtySet.has(item.parentKey + '.' + item.key.split('$')[0]));
  }

  render() {
    const sections = this.props.sections;
    const theme = this.props.theme || new DefaultTheme(this);
    if (!sections || sections.length === 0) {
      return theme.noSections();
    }
    return theme.sections(sections, this.props.submit);
  }
}
