const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select('-_v -password');

                return userData;
            }

            throw AuthenticationError;
        },
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError;
            }

            const correcPw = await user.isCorrectPassword(password);

            if (!correcPw) {
                throw  AuthenticationError;
            }

            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookData } },
                    { new: true, runValidators: true }
                );
                return updatedUser;
            }
            throw AuthenticationError;
        },

        saveBook1: async (parent, { bookId, title, description, image, link}, context) => {
            console.log(bookId);
            console.log(title);
            console.log(description);
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: {bookId: bookId,
                                                title: title,
                                                description: description,
                                                image: image,
                                                link: link} }},
                    { new: true, runValidators: true }
                );
                return updatedUser;
            }
            throw AuthenticationError;
        },

        removeBook: async (parent, { bookId: bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw AuthenticationError;
        },
    },
};

module.exports = resolvers;
