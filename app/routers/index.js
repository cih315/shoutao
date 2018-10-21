const router = new require('koa-router')()
import go from '../controller/go'
import home from '../controller/home'

router.get('/', home.index)

router.get('/cat/list', home.cat_list)
router.get('/cat/:id', home.list)
router.get('/cat/:id/:page', home.cat)

router.get('/item/:iid', home.item)
router.get('/similar/:iid', home.similar)

router.get('/search', home.search)
router.get('/search/result', home.search_result)

router.post('/uland', home.uland)

router.get('/go', go.index)
router.get('/go/:itemid', go.item)

export default router