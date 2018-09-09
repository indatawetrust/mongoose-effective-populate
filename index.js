module.exports = function(schema, options) {

  schema.query.effectivePopulate = function(opts) {

    const keys = Object.keys(opts);

    return new Promise((resolve, reject) => {
      this.then(datas => {
        const promises = [];

        for (let data of datas) {
          data = data.toObject();

          for (let name of keys) {
            const {ref, localField, foreignField, type} = opts[name];

            switch (type) {
              case 'resultCount':
                promises.push(
                  new Promise((resolve, reject) => {
                    this.model.db
                      .model(ref)
                      .count({
                        [foreignField]: data[localField],
                      })
                      .then(count =>
                        resolve(
                          Object.assign(data, {
                            [name]: count,
                          })
                        )
                      )
                      .catch(reject);
                  })
                );
                break;
              case 'resultMatch':
                promises.push(
                  new Promise((resolve, reject) => {
                    this.model.db
                      .model(ref)
                      .findOne(
                        Object.assign(
                          {
                            [foreignField]: data[localField],
                          },
                          data.value
                        )
                      )
                      .then(match =>
                        resolve(
                          Object.assign(data, {
                            [name]: match ? true : false
                          })
                        )
                      )
                      .catch(reject);
                  })
                );
                break;
            }
          }
        }

        Promise.all(promises).then(resolve).catch(reject);
      }).catch(reject);
    });
  }

}
