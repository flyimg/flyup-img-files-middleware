function $(selector) {
    let foundNodes = document.querySelectorAll(selector);
    if (!foundNodes.length) {
        return [];
    }
    return Array.prototype.map.call(foundNodes, obj => obj);
}
Dropzone.options.uploadFormZone = {
    paramName: "uploaded_file",
};
console.log("js loaded");
