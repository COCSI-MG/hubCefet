'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('class_cancellations');
    await queryInterface.dropTable('class_students');
    await queryInterface.dropTable('class_schedules');
    await queryInterface.dropTable('classes');
    await queryInterface.dropTable('semesters');
    await queryInterface.dropTable('subjects');
    await queryInterface.dropTable('time_slots');
    await queryInterface.dropTable('rooms');
    await queryInterface.dropTable('buildings');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('buildings', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.createTable('rooms', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      building_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'buildings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });


    await queryInterface.createTable('time_slots', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('subjects', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.createTable('semesters', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.createTable('classes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      semester_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'semesters',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      teacher_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      time_slot_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'time_slots',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.createTable('class_schedules', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      day_of_week: {
        type: Sequelize.STRING,
        allowNull: false
      },
      start_time: {
        type: Sequelize.STRING,
        allowNull: false
      },
      end_time: {
        type: Sequelize.STRING,
        allowNull: false
      },
      building_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'buildings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.createTable('class_students', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.createTable('class_cancellations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'class_id'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      students_notified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      canceled_by: {
        type: Sequelize.UUID,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  }
};
