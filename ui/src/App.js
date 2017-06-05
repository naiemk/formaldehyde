import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import FormDownEditor from './components/FormDownEditor'
import {Sections} from './components/formdown/Sections'
import formdown from './components/formdown/utils/formdown'

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      formdown: `

SECTION    General

GROUP      Contact info
Update your contact info
<Upload> Upload your data
_ Name
_ Surname
__ Address
_ City
[Select One, WA, NY] State

GROUP      Salary info
How much do you make?
_ Monthly income
_ Tax
O [Single, Married] Marriage status

GROUP      Personal details
X *[Computers,
Gadgets,
Music]     Interests

SECTION    Summary
This section contains a summary of all components

GROUP      All components
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
# Add comments here
  `
    }

    this.handleChange = this.handleChange.bind(this);
    this.fdContext = formdown();
  }

  handleChange(event) {
    let sections = this.fdContext.multiSectionCompile(event.target.value);

    this.setState({ formdown: event.target.value,
      sections: sections });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <div className="App-main">
          <h3>Enter markup you liked</h3>
          <FormDownEditor
            text={this.state.formdown}
            onChange={this.handleChange}
          />
          <pre>
            <Sections sections={this.state.sections} />
          </pre>
        </div>
      </div>
    );
  }
}

export default App;
