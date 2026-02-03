function createTree(data, parentId = "") {
    const tree = [];
    data.forEach((item) => {
        if (item.father_id === String(parentId)) {
            const newItem = item;
            const children = createTree(data, String(item._id));
            if (children.length > 0) {
                newItem.children = children;
            }
            tree.push(newItem);
        }
    });
    return tree;
}
module.exports = { createTree };