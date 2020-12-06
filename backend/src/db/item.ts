import { Schema, model, Document } from 'mongoose'

export interface ISacItem {
  title: string
  description: string
}

export interface IItemModel extends ISacItem, Document {}

const modelSchema = new Schema<ISacItem>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true }
  },
  { timestamps: true }
)

// Replaces '_id' with 'id' and removes '_v'
modelSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    delete ret._id
  }
})

export const ItemModel = model<IItemModel>('Item', modelSchema)

interface IGetParams {
  title?: string
  limit?: number
}

export async function get(params?: IGetParams) {
  const { title, limit = 100 } = params || {}

  if (title) {
    return await ItemModel.find({ title: { $regex: title, $options: 'i' } })
      .limit(limit)
      .exec()
  }

  return await ItemModel.find().limit(limit).exec()
}

export function add(item: ISacItem) {
  return ItemModel.create(item)
}

export function findAndUpdate(item: ISacItem & { id: string }) {
  const { id, title, description } = item

  return ItemModel.findOneAndUpdate(
    { _id: id },
    { title, description },
    { runValidators: true, new: true }
  )
}

export function remove({ id }) {
  return ItemModel.findByIdAndRemove(id)
}
