package com.hazdik.kasirtoko.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor
public class Product extends BaseEntity {

    @Column(unique = true)
    private String barcode;
    private String name;
    private BigDecimal price;
    private int stock;
}
