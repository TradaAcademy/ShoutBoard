export default {
    text: (selector, t) => {
        document.querySelector(selector).textContent = t;
    },

    loadTemplates: () => {
        const obj = {};
        document.querySelectorAll("script[data-template]").forEach(tag => {
            var name = tag.getAttribute("data-template");
            obj[name] = tag.innerHTML;
        })

        return obj;
    },

    page: (thePage, callback) => {
        console.log(thePage)
        let name = thePage;
        if (typeof name !== "string") {
            name = thePage.name;
            callback = callback || thePage.onInit;
        }

        document.querySelectorAll(".page").forEach(tag => {
            const pageName = tag.getAttribute("data-name");
            if (pageName === name) {
                tag.classList.add("show");
            } else {
                tag.classList.remove("show");
            }
        })

        console.log(callback)
        callback && callback(thePage);
    },

    merge: (template, data) => {
        _.each(data, (value, key) => {
            template = template.split("#{" + key + "}").join(value);
        });
        return template;
    },

    tag: (html) => {
        const div = document.createElement('div');
        div.innerHTML = html.trim();
        return div.firstChild;
    },

    formatAddr: (addr) => {
        return addr.substr(0, 5) + "…" + addr.substr(-3);
    },

    avatar: (hash, account) => {
        return hash ?
            `https://gateway.ipfs.io/ipfs/${hash}` :
            `http://i.pravatar.cc/150?u=${account}`;
    },

    contracts: async (collector, jsonArray, defAccount, callback) => {
        const networkId = await web3.eth.net.getId();
        _.each(jsonArray, json => {
            collector[json.contractName] = new web3.eth.Contract(json.abi,
                json.networks[networkId].address, {from: defAccount});
        })
        callback(collector);
    }
}