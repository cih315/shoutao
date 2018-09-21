import mongoose from 'mongoose'
import GoodsSchema from './goods'

export const Goods = mongoose.model('Goods', GoodsSchema)