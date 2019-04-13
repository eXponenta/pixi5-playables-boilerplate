import container from "./ContainerExt";
import display from "./DisplayExt";
import loader from "./LoaderExt";
import emitter from "./EventEmitterExt";
 
const path = function() {
    container();
    display();
    emitter();
    loader();
}

export default path;