import container from "./ContainerExt";
import display from "./DisplayExt";
import loader from "./LoaderExt";

export default  function HookPixi() {
    container();
    display();
    loader();
}