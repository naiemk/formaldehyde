
let rendererMap = {
  shortTextbox: (item, theme) =>  theme.shortTextbox(item),
  longTextbox: (item, theme) =>  theme.longTextbox(item),
  textarea: (item, theme) =>  theme.textarea(item),
  checkbox: (item, theme) =>  theme.checkbox(item),
  select: (item, theme) =>  theme.select(item),
  multiSelect: (item, theme) => theme.multiSelect(item),
  radioGroup: (item, theme) => theme.radioGroup(item),
  checkboxGroup: (item, theme) => theme.checkboxGroup(item),
  calendar: (item, theme) => theme.calendar(item),
  custom: (item, theme) => theme.custom(item)
}

export function FormControl(params) {
  const theme = params.theme;
  let renderer = rendererMap[params.item.type];
  return renderer ? renderer(params.item, theme) :
                      theme.controlNotSupported(params.item.type);
}

export function FormDownRender(params) {
  const form = params.form;
  const theme = params.theme;
  if (!form) {
    return theme.noForm();
  }
  return theme.form(form);
}
