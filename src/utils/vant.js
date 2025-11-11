// src/plugins/vant.js
// 只导入需要的 Vant 组件，不导入 Vue（Vue 3 无需此操作）
import { Button, Dialog, Tab, Tabs, Toast } from 'vant'

import { NavBar } from 'vant'
import { Icon } from 'vant'
import { Form, Field, CellGroup } from 'vant'
import { Picker } from 'vant'
import { RadioGroup, Radio } from 'vant'
import { Checkbox, CheckboxGroup } from 'vant'
import { Divider } from 'vant'
import { Search } from 'vant'
import { Col, Row } from 'vant'
import { Grid, GridItem } from 'vant'
import { Tabbar, TabbarItem } from 'vant'
import { Image as VanImage } from 'vant'
import { Tag } from 'vant'
import { Cell } from 'vant'
import { Uploader } from 'vant'
import 'vant/lib/index.css'
// 导出一个注册函数，接收 app 实例（由 main.js 传递过来）

export function setupVant(app) {
  // 通过 app 实例注册组件（Vue 3 语法）
  app.use(Button)
  app.use(Dialog)
  app.use(Tab)
  app.use(Tabs)
  app.use(NavBar)
  app.use(Icon)
  app.use(Form)
  app.use(Field)
  app.use(CellGroup)
  app.use(Picker)
  app.use(RadioGroup)
  app.use(Radio)
  app.use(Checkbox)
  app.use(CheckboxGroup)
  app.use(Divider)
  app.use(Toast)
  app.use(Search)
  app.use(Col)
  app.use(Row)
  app.use(Grid)
  app.use(GridItem)
  app.use(Tabbar)
  app.use(TabbarItem)
  app.use(VanImage)
  app.use(Tag)
  app.use(Cell)
  app.use(Uploader)
}
