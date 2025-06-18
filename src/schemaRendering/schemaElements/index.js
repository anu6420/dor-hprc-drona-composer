import Text from "./Text";
import Select from "./Select";
import Number from "./Number";
import Checkbox from "./Checkbox";
import RowContainer from "./RowContainer";
import { CollapsibleRowContainer, CollapsibleColContainer } from "./CollapsibleContainer";
import RadioGroup from "./RadioGroup";
import Picker from "./Picker";
import Uploader from "./Uploader";
import Time from "./Time";
import Module from "./Module";
import Unit from "./Unit";
import UnknownElement from "./UnknownElement";
import DynamicSelect from "./DynamicSelect";
import TextArea from "./TextArea";
import StaticText from "./StaticText";
import AutocompleteSelect from "./AutocompleteSelect";
import DragDropContainer from "./DragDropContainer";


export {
	Text,
	Select,
	Number,
	Checkbox,
	RowContainer,
	RadioGroup,
	Picker,
	Uploader,
	Time,
	Module,
	Unit,
	UnknownElement,
	DynamicSelect,
	TextArea,
	StaticText,
	AutocompleteSelect,
	CollapsibleRowContainer,
	CollapsibleColContainer,
	DragDropContainer
}

export const componentsMap = {
  text: Text,
  select: Select,
  number: Number,
  checkbox: Checkbox,
  rowContainer: RowContainer,
  radioGroup: RadioGroup,
  picker: Picker,
  uploader: Uploader,
  time: Time,
  module: Module,
  unit: Unit,
  dynamicSelect: DynamicSelect,
  textarea: TextArea,
  staticText: StaticText,
  autocompleteSelect: AutocompleteSelect,
  collapsibleRowContainer: CollapsibleRowContainer,
  collapsibleColContainer: CollapsibleColContainer,
  dragDropContainer: DragDropContainer
};

export const Containers = ["rowContainer", "collapsibleRowContainer", "collapsibleColContainer", "dragDropContainer"];

