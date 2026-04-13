---
name: evnict-kit-database-migration
description: Tạo migration script chuẩn — naming, UP/DOWN scripts, test, hỗ trợ Oracle + SQL Server.
compatibility: Oracle 19c, SQL Server 2019+, Flyway/Liquibase
---

# evnict-kit-database-migration — Database Migration

## Khi nào dùng
- Thêm/sửa/xóa table, column, index
- Thay đổi schema database qua migration script
- Tạo rollback script cho thay đổi DB

## Input Parameters
- `action` (bắt buộc): create-table | alter-table | add-index | add-column | drop-column | seed-data
- `description` (bắt buộc): Mô tả thay đổi
- `database` (optional): oracle | sqlserver (default: từ config)

---

## Workflow Steps

### Bước 1: Xác định thông tin
Đọc `.evnict/config.yaml` → database type
Đọc `.agent/rules/05-evnict-kit-project-conventions.md` → RP05 DB conventions

### Bước 2: Tạo migration files

#### Naming convention
```
V{YYYYMMDD}_{seq}__{description}.sql          ← UP
V{YYYYMMDD}_{seq}__{description}_ROLLBACK.sql ← DOWN
```
Ví dụ:
```
V20260401_001__create_table_customer.sql
V20260401_001__create_table_customer_ROLLBACK.sql
```

### Bước 3: Viết UP script

#### Oracle — CREATE TABLE
```sql
-- V20260401_001__create_table_customer.sql
CREATE TABLE CUSTOMER (
    ID              NUMBER(19) NOT NULL,
    NAME            NVARCHAR2(200) NOT NULL,
    PHONE           VARCHAR2(20),
    EMAIL           VARCHAR2(100),
    DON_VI_ID       NUMBER(19) NOT NULL,
    STATUS          VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,
    IS_DELETED      NUMBER(1) DEFAULT 0 NOT NULL,
    CREATED_BY      VARCHAR2(50),
    CREATED_DATE    TIMESTAMP DEFAULT SYSTIMESTAMP,
    UPDATED_BY      VARCHAR2(50),
    UPDATED_DATE    TIMESTAMP,
    CONSTRAINT PK_CUSTOMER PRIMARY KEY (ID),
    CONSTRAINT FK_CUSTOMER_DON_VI FOREIGN KEY (DON_VI_ID) REFERENCES DON_VI(ID)
);

CREATE SEQUENCE CUSTOMER_SEQ START WITH 1 INCREMENT BY 1;

CREATE INDEX IX_CUSTOMER_DON_VI ON CUSTOMER(DON_VI_ID);
CREATE INDEX IX_CUSTOMER_STATUS ON CUSTOMER(STATUS);

COMMENT ON TABLE CUSTOMER IS 'Bảng khách hàng';
COMMENT ON COLUMN CUSTOMER.NAME IS 'Tên khách hàng';
COMMENT ON COLUMN CUSTOMER.STATUS IS 'Trạng thái: ACTIVE, INACTIVE, SUSPENDED';
```

#### Oracle — ALTER TABLE
```sql
-- V20260402_001__add_customer_address.sql
ALTER TABLE CUSTOMER ADD (
    ADDRESS NVARCHAR2(500),
    DISTRICT_CODE VARCHAR2(10)
);

CREATE INDEX IX_CUSTOMER_DISTRICT ON CUSTOMER(DISTRICT_CODE);

COMMENT ON COLUMN CUSTOMER.ADDRESS IS 'Địa chỉ khách hàng';
```

#### SQL Server — CREATE TABLE
```sql
-- V20260401_001__create_table_customer.sql
CREATE TABLE Customer (
    Id              BIGINT IDENTITY(1,1) NOT NULL,
    Name            NVARCHAR(200) NOT NULL,
    Phone           NVARCHAR(20) NULL,
    Email           NVARCHAR(100) NULL,
    DonViId         BIGINT NOT NULL,
    Status          NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    IsDeleted       BIT NOT NULL DEFAULT 0,
    CreatedBy       NVARCHAR(50) NULL,
    CreatedDate     DATETIME2 DEFAULT GETDATE(),
    UpdatedBy       NVARCHAR(50) NULL,
    UpdatedDate     DATETIME2 NULL,
    CONSTRAINT PK_Customer PRIMARY KEY (Id),
    CONSTRAINT FK_Customer_DonVi FOREIGN KEY (DonViId) REFERENCES DonVi(Id)
);

CREATE INDEX IX_Customer_DonVi ON Customer(DonViId);
CREATE INDEX IX_Customer_Status ON Customer(Status);
```

### Bước 4: Viết ROLLBACK script

#### Oracle
```sql
-- V20260401_001__create_table_customer_ROLLBACK.sql
DROP INDEX IX_CUSTOMER_STATUS;
DROP INDEX IX_CUSTOMER_DON_VI;
DROP SEQUENCE CUSTOMER_SEQ;
DROP TABLE CUSTOMER;
```

#### SQL Server
```sql
-- V20260401_001__create_table_customer_ROLLBACK.sql
DROP INDEX IX_Customer_Status ON Customer;
DROP INDEX IX_Customer_DonVi ON Customer;
DROP TABLE Customer;
```

### Bước 5: Test migration
```bash
# Chạy UP
flyway migrate
# hoặc chạy script thủ công trong DB client

# Verify: table/column tồn tại
# Oracle
SELECT * FROM USER_TABLES WHERE TABLE_NAME = 'CUSTOMER';
SELECT * FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'CUSTOMER';

# Chạy ROLLBACK
# Verify: table/column đã xóa
```

### Bước 6: KHÔNG làm
- ❌ KHÔNG sửa DB trực tiếp (phải qua migration script)
- ❌ KHÔNG DROP TABLE trong production
- ❌ KHÔNG ALTER column type nếu có data (phải migrate data trước)
- ❌ KHÔNG hardcode data trong migration (trừ seed data rõ ràng)

---

## Checklist per migration
- [ ] UP script chạy thành công
- [ ] ROLLBACK script chạy thành công
- [ ] Naming đúng convention: `V{date}_{seq}__{desc}.sql`
- [ ] Có COMMENT cho table và columns quan trọng
- [ ] Index cho foreign keys và columns hay query
- [ ] Audit columns (CREATED_BY, CREATED_DATE, UPDATED_BY, UPDATED_DATE)
- [ ] Soft delete column nếu cần (IS_DELETED)

---

## Tiêu chí hoàn thành
- [ ] UP script tạo và test pass
- [ ] ROLLBACK script tạo và test pass
- [ ] Naming convention đúng
- [ ] Comments và indexes đầy đủ
