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
import { Loading } from 'vant'
import { List } from 'vant'
import { DropdownMenu, DropdownItem } from 'vant'
import { Popup } from 'vant'
import { Badge } from 'vant'
import { Empty } from 'vant'
import { Card } from 'vant'
import { Collapse, CollapseItem } from 'vant'
import { Switch } from 'vant' // 新增Switch
import { Popover } from 'vant' // 新增Popover（消息操作更多菜单）
import { Swipe, SwipeItem } from 'vant' // 新增Swipe（轮播图）组件
import { DatePicker } from 'vant'

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
  app.use(Loading)
  app.use(List)
  app.use(DropdownMenu)
  app.use(DropdownItem)
  app.use(Popup)
  app.use(Badge)
  app.use(Empty)
  app.use(Card)
  app.use(Collapse)
  app.use(CollapseItem)
  app.use(Switch) // 注册Switch组件
  app.use(Popover) // 注册Popover组件
  app.use(Swipe) // 注册Swipe组件
  app.use(SwipeItem) // 注册SwipeItem组件
  app.use(DatePicker) // 注册DatePicker组件
}
