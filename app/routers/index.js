const router = new require('koa-router')()
import go from '../controller/go'
import home from '../controller/home'
import jd from '../controller/jd'

router.get('/', home.index)
router.get('/search', home.search)
router.get('/search/result', home.search_result)
router.get('/search/:pid', home.search)

router.get('/parse', home.parse)
router.get('/parse/:pid', home.parse)

router.get('/go', go.index)
router.get('/go/:itemid', go.item)
router.get('/go/:itemid/:pid', go.item)

router.get('/short/:itemid', go.short)
router.get('/short/:itemid/:pid', go.short)



router.get('/cat/list', home.cat_list)
router.get('/cat/:id', home.list)
router.get('/cat/:id/:pid', home.list)
router.get('/cat/list/:id/:page', home.cat)

router.get('/item/:iid', home.item)
router.get('/item/:iid/:pid', home.item)

router.get('/similar/:iid', home.similar)

router.post('/uland', home.uland)

router.get('/jd', jd.index)
router.get('/jd/:skuid', jd.detail)

router.get('/:pid', home.index)

export default router