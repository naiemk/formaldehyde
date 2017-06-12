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
    this.state = { dataModel : {} };
  }

  handleChange(event) {
    let target = event.target;
    let targetType = target.type;
    if (!targetType) return;
    let parentKey = target.getAttribute('data-parent-key') || '';
    let key = (target.getAttribute('data-key') || '').split('$')[0];
    let value = target.value;
    let checkboxName = target.name.split('$')[0]
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
        dataModelKey = parentKey + '.' + checkboxName;
        value = key;
        break;
      case 'checkbox':
        let multiCheckbox = (target.getAttribute('data-multiple') || '') === 'true';
        if (multiCheckbox) {
          dataModelKey = parentKey + '.' + checkboxName;
          value = (this.state.dataModel[dataModelKey] || {})
          value = {...value, [key]: target.checked}
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
    this.setState({...this.sate, dataModel: dataModel});
    // console.log(this.dataModel);
  }

  getValue(item) {
    if (!item || !item.key) return {};
    let key = item.key.split('$')[0];
    let parentKey = (item.parentKey || "");
    return (this.state.dataModel[parentKey + '.' + key] || item.value || [])
  }

  getHistory(item) {
    return [
      { id: 1, time: '2018/01/01', actor: 'naiem', value: 'Some value here',
        note: 'This was no good! Try better!'},
      { id: 2, time: '2018/01/01', actor: 'chili', value: 'love' }
      ];
  }

  render() {
    const sections = this.props.sections;
    const theme = this.props.theme || new DefaultTheme(this);
    if (!sections || sections.length === 0) {
      return theme.noSections();
    }
    return theme.sections(sections);
  }
}
