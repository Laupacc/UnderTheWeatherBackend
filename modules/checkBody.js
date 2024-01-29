function checkBody(body, fields) {
    for (let i = 0; i < fields.length; i++) {
        let field = body[fields[i]];
        if (typeof field === 'string') {
            if (!field || field.trim() === '') {
                return false;
            }
        } else if (!field) {
            return false;
        }
    } return true;
};


module.exports = { checkBody };