module.exports = (sequelize, DataTypes) => {
  const Video = sequelize.define('Video', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true
  });

  Video.associate = function(models) {
    Video.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author'
    });
  };

  return Video;
};