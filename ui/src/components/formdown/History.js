import { Component } from 'react';

export class History extends Component {
  constructor() {
    super();
    this.state = {};
  }
  render() {
    const item = this.props.item;
    const theme = this.props.theme;
    const service = this.props.service;

    let history = service.getHistory(item);
    if (!history) {
      return null;
    }
    return theme.renderHistory(history, item.key)
  }
}
