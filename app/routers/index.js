const router = new require('koa-router')()
import go from '../controller/go'

router.get('/go/:hashid', go.index)

export default router