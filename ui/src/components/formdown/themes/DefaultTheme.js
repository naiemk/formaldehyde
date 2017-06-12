

import React from 'react';
import {Section} from '../Sections'
import {FormDownRender, FormControl} from '../FormDownRender'
import {History} from '../History'
import './Default.css'

export default class DefaultTheme {
  constructor(component) {
    this.comp = component;
    this.handleChange = this.comp.handleChange.bind(this.comp);
  }

  noSections() {
    return (
      <h3> No Sections </h3>
    )
  }

  sections(sections) {
    let comp = this.comp;
    if (!sections || sections.length === 0) return this.noSections();
    let selectedSection = comp.state.selectedSection || sections[0].key;
    return (
      <div className="container">
        <div className="card text-center">
          <div className="card-header">
            <ul className="nav nav-tabs card-header-tabs">
              {sections.map(s =>(
                  <li key={s.key} className="nav-item">
                    <a className={"hand nav-link "
                        + (selectedSection === s.key ? "active" : "") }
                        onClick={() => {
                                  comp.setState({...comp.state, selectedSection: s.key});
                                  return false;
                                }}
                        >{s.name}</a>
                  </li>
              ))}
            </ul>
          </div>
          <div className="card-block">
            { sections.filter(s => s.key === selectedSection)
                .map(s =>(
                  <Section key={s.key} theme={this} section={s} />
                ))}
          </div>
        </div>
      </div>
    )
  }

  section(section) {
    return (
      <div>
        <p className="card-text">{section.comments}</p>
        {section.forms.map(f => (
          <FormDownRender key={f.key} form={f} theme={this} />
        ))}
      </div>
    );
  }

  noForm() {
    return (
      <h3> No form </h3>
    )
  }

  form(form) {
    return (
      <div className="card space-under">
        <div className="card-header">
          {form.label}
        </div>
        <div className="card-block text-left">
          {form.controls.map(c => (
            <FormControl key={c.key} item={c} theme={this}/>
          ))}
        </div>
        <hr className="col-xs-12"></hr>
        <blockquote className="card-blockquote">
          {form.comments}
        </blockquote>
      </div>
    )
  }

  controlNotSupported(type) {
    return (<b>{type} not supported!</b>)
  }

  shortTextbox(item, watermark) {
    return (
      <div>
        <div className="row">
          <div className="col-6">
            <div className="form-group">
              <label>{item.label}</label>
              <input type="text" className="form-control"
                     data-key={item.key} data-parent-key={item.parentKey}
                     onChange={this.handleChange}
                     placeholder={watermark || item.label}
                     value={this.comp.getValue(item)}
                     />
              <small className="form-text text-muted">{item.comments}</small>
            </div>
          </div>
        </div>
        <History item={item} service={this.comp} theme={this} />
      </div>
      )
  }

  longTextbox(item) {
    return (this._wrapLabel(item,() => {
        return (
          <input type="text" className="form-control"
                 data-key={item.key} data-parent-key={item.parentKey}
                 onChange={this.handleChange}
                 placeholder={item.label}/>
         )
      })
    )
  }

  textarea(item) {
    return (this._wrapLabel(item,() => {
        return (
          <textarea className="form-control" rows="3"
            data-key={item.key} data-parent-key={item.parentKey}
            onChange={this.handleChange}
            value={item.value}
          ></textarea>
          )
      }))
  }

  checkbox(item, type="checkbox", multiple=false) {
    return (
      <div className="form-check" key={item.key}>
        <label className="form-check-label">
          <input className="form-check-input" type={type}
                  onChange={this.handleChange}
                  data-key={item.key}
                  name={item.name}
                  data-parent-key={item.parentKey}
                  data-multiple={multiple}
                  checked={item.checked}
                  value="" />
           &nbsp;{item.label}
        </label>
      </div>
    );
  }

  select(item) {
    return (this._wrapLabel(item,() => (<div>
        <select type='select' className="form-control custom-select"
        data-key={item.key} data-parent-key={item.parentKey}
        onChange={this.handleChange}
        >
          {item.list.map((lit) => (
            <option key={lit}> {lit} </option>
          ))}
        </select>
        </div>
    )));
  }

  multiSelect(item) {
    return this._wrapLabel(item,() => (<div>
        <select className="form-control" size={item.list.length} multiple
        data-key={item.key} data-parent-key={item.parentKey}
        onChange={this.handleChange}
        >
          {item.list.map((lit) => (
            <option key={lit}> {lit} </option>
          ))}
        </select>
        </div>
    ))
  }

  radioGroup(item) {
    return this._wrapLabel(item, () => (
      <div className="form-group">
        {item.list.map((lit) => (
          this.checkbox({key: lit, parentKey: item.parentKey,
                          name: item.key, label: lit}, "radio")
        ))}
      </div>
    ))
  }

  checkboxGroup(item) {
    return this._wrapLabel(item, () => (
      <div className="form-group">
        {item.list.map((lit) => (
          this.checkbox({key: lit, parentKey: item.parentKey,
                          name: item.key, label: lit}, "checkbox", item.list.length > 1)
        ))}
      </div>
    ))
  }

  calendar(item) {
      let ddmm = Date.parse('1/10/2000') > Date.parse('10/1/2000');
      return this.shortTextbox(item, ddmm ? 'YYYY/MM/DD' : 'MM/DD/YYYY');
  }


  _camelCase(dashedKey) {
      if (!dashedKey) {
        return  "";
      }
      return dashedKey.split('-')
          .map(p => p.substr(0,1).toUpperCase() + p.toLowerCase().substr(1))
          .join('')
  }

  custom(item) {
    let handler = this.__proto__['render' + this._camelCase(item.customTag)]
    if (!handler) {
      return (
        <b> {item.customTag} <br/></b>
      )
    }
    return handler.call(this, item)
  }

  renderUpload(item) {
    return (
      <div>
        {this._wrapLabel(item, () => (
          <input type="file" data-key={item.key} data-parent-key={item.parentKey}
                className="form-control" onChange={this.handleChange} />
         ))}
         {this.comp.getValue(item).length > 0 ?
            <div className = "col-12 blockquote">
              <ul className="list-group">
                {this.comp.getValue(item).map(file => (
                  <li key={file.file} className="list-group-item justify-content-between">
                    <small>
                      {file.file}
                    </small>
                    {
                      file.uploaded ?
                        <span className="badge badge-success badge-pill">ready</span>
                        : <span className="badge badge-default badge-pill">...</span>
                    }
                  </li>
                ))}
              </ul>
            </div> : <div> </div>
          }
      </div>
    );
  }

  renderHistory(history, key) {
    return (
      <div>
        <div className="float-right">
          <button className="btn btn-outline-primary btn-sm" onClick={() => {
            let state = this.comp.state['hist-vis-' + key];
            this.comp.setState({...this.comp.state, ['hist-vis-' + key] : !state})
                console.log(this.comp.state['hist-vis-' + key] )
            }
          }>
              history
          </button>
        </div>
        {this.comp.state['hist-vis-' + key] === true ? (
            <div id={'col-' + key}>
              <div className="history card card-block">
                {history.map(hist => (
                  <div className="row" key={hist.id}>
                    <div className="col-8 text-muted small">
                      &nbsp;&nbsp;
                      {hist.actor ? <span className="badge badge-info">{hist.actor}</span> : null}
                      {hist.time} -&nbsp;
                      {hist.value}
                      {hist.note ?
                        <div className="history alert alert-warning" role="alert">
                          {hist.note}
                        </div> : null}
                    </div>
                  </div>
              ))}
            </div>
            </div>
        ) : null}
      </div>
    )
  }

  _wrapLabel(item, renderer) {
    return (
      <div className="form-group">
        <label>{item.label}</label>
        {renderer()}
        <small className="form-text text-muted">{item.comments}</small>
      </div>
    )
  }
}
