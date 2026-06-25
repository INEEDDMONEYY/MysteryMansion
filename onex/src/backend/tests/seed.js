import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import Post from '../src/models/Post.js';

const seedPosts = async (count = 5) => {
  const mockPosts = Array.from({ length: count }).map(() => ({
    userId: new mongoose.Types.ObjectId(),
    username: faker.internet.username(),               // ✅ required
    title: faker.lorem.words(3),                       // ✅ required
    description: faker.lorem.paragraph(),              // ✅ required
    picture: faker.image.url(),                        
    city: faker.location.city(),                       
    state: faker.location.state(),                     
    category: faker.word.noun(),                       
    visibility: faker.helpers.arrayElement(['Men', 'Women', 'Both']),
    acknowledgedPayment: faker.datatype.boolean(),     
  }));

  await Post.deleteMany();
  await Post.insertMany(mockPosts);
};

export default seedPosts;
