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
    this.state = {};
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
