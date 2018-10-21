const redis_client = require('async-redis').createClient();


(
    async function () {
        var data = await redis_client.get('item_detail:' + 111)
        console.log(data)
    }

)()